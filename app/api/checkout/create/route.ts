import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { alunos, pedidos, cursos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import {
  criarOuRecuperarCliente,
  criarCobranca,
  gerarPixQrCode,
  asaasDueDate,
} from '@/lib/asaas'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      cursoId,
      nome,
      email,
      cpf,
      telefone,
      senha,
      formaPagamento, // 'pix' | 'cartao' | 'boleto'
      parcelas = 1,
      // Cartão (tokenizado no frontend via Asaas.js)
      cartaoNumero,
      cartaoNome,
      cartaoExpMes,
      cartaoExpAno,
      cartaoCvv,
    } = body

    if (!cursoId || !nome || !email || !senha || !formaPagamento) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // 1. Buscar curso
    const [curso] = await db.select().from(cursos).where(eq(cursos.id, cursoId))
    if (!curso || !curso.ativo) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    const valorVenda = parseFloat(curso.precoVenda ?? curso.precoReferencia ?? '0')
    if (valorVenda <= 0) {
      return NextResponse.json({ error: 'Curso sem preço configurado' }, { status: 400 })
    }

    // 2. Criar ou recuperar aluno
    let alunoId: string
    const [alunoExistente] = await db.select().from(alunos).where(eq(alunos.email, email))

    if (alunoExistente) {
      alunoId = alunoExistente.id
    } else {
      const senhaHash = await bcrypt.hash(senha, 10)
      const [novoAluno] = await db.insert(alunos).values({
        nome,
        email,
        senhaHash,
        cpf: cpf ?? null,
        telefone: telefone ?? null,
      }).returning()
      alunoId = novoAluno.id
    }

    // 3. Criar/recuperar cliente no Asaas
    const asaasCliente = await criarOuRecuperarCliente({
      name: nome,
      email,
      cpfCnpj: cpf,
      mobilePhone: telefone,
    })

    // Salvar asaasCustomerId no aluno
    await db.update(alunos)
      .set({ asaasCustomerId: asaasCliente.id })
      .where(eq(alunos.id, alunoId))

    // 4. Criar pedido no DB (pendente)
    const [pedido] = await db.insert(pedidos).values({
      alunoId,
      cursoId,
      valor: valorVenda.toFixed(2),
      formaPagamento,
      parcelas,
    }).returning()

    // 5. Criar cobrança no Asaas
    const billingType =
      formaPagamento === 'pix' ? 'PIX' :
      formaPagamento === 'cartao' ? 'CREDIT_CARD' : 'BOLETO'

    const cobrancaInput: Parameters<typeof criarCobranca>[0] = {
      customer: asaasCliente.id,
      billingType,
      value: valorVenda,
      dueDate: asaasDueDate(1),
      description: `${curso.nome} — NBP Psicanálise`,
      externalReference: pedido.id,
      ...(billingType === 'CREDIT_CARD' && parcelas > 1 ? {
        installmentCount: parcelas,
        installmentValue: parseFloat((valorVenda / parcelas).toFixed(2)),
      } : {}),
      ...(billingType === 'CREDIT_CARD' && cartaoNumero ? {
        creditCard: {
          holderName: cartaoNome,
          number: cartaoNumero,
          expiryMonth: cartaoExpMes,
          expiryYear: cartaoExpAno,
          ccv: cartaoCvv,
        },
        creditCardHolderInfo: {
          name: nome,
          email,
          cpfCnpj: cpf ?? '',
          phone: telefone,
        },
        remoteIp: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
      } : {}),
    }

    const cobranca = await criarCobranca(cobrancaInput)

    // 6. Atualizar pedido com dados do Asaas
    const updateData: Partial<typeof pedidos.$inferInsert> = {
      asaasPaymentId: cobranca.id,
      asaasPaymentLink: cobranca.invoiceUrl,
    }

    // Buscar QR PIX se for PIX
    let pixData = null
    if (billingType === 'PIX') {
      const pix = await gerarPixQrCode(cobranca.id)
      updateData.pixQrCode = pix.encodedImage
      updateData.pixChaveCopiaECola = pix.payload
      updateData.pixExpiracao = new Date(pix.expirationDate)
      pixData = pix
    }

    if (billingType === 'BOLETO') {
      updateData.boletoUrl = cobranca.bankSlipUrl ?? cobranca.invoiceUrl
    }

    await db.update(pedidos).set(updateData).where(eq(pedidos.id, pedido.id))

    // 7. Retornar dados de pagamento
    return NextResponse.json({
      pedidoId: pedido.id,
      status: 'pendente',
      formaPagamento,
      valor: valorVenda,
      asaasPaymentId: cobranca.id,
      invoiceUrl: cobranca.invoiceUrl,
      // PIX
      ...(pixData ? {
        pixQrCode: pixData.encodedImage,
        pixChaveCopiaECola: pixData.payload,
        pixExpiracao: pixData.expirationDate,
      } : {}),
      // Boleto
      ...(billingType === 'BOLETO' ? {
        boletoUrl: cobranca.bankSlipUrl ?? cobranca.invoiceUrl,
      } : {}),
      // Cartão: confirmação imediata se status for CONFIRMED/RECEIVED
      ...(billingType === 'CREDIT_CARD' ? {
        cartaoStatus: cobranca.status,
        confirmado: ['CONFIRMED', 'RECEIVED'].includes(cobranca.status),
      } : {}),
    })
  } catch (err) {
    console.error('[checkout/create]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro interno' },
      { status: 500 }
    )
  }
}
