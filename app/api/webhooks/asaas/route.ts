/**
 * POST /api/webhooks/asaas
 * Recebe eventos do Asaas e processa confirmações de pagamento
 * Config no painel Asaas: Integrações → Webhooks → URL do site
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pedidos, matriculas, alunos, cursos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Resend } from 'resend'

// Eventos que confirmam pagamento
const EVENTOS_PAGOS = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']

export async function POST(req: NextRequest) {
  try {
    // Validar token de segurança configurado no painel Asaas
    const token = req.headers.get('asaas-access-token')
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.warn('[webhook] Token inválido:', token)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { event, payment } = body as {
      event: string
      payment: {
        id: string
        status: string
        value: number
        billingType: string
        externalReference?: string // nosso pedidoId
      }
    }

    console.log(`[webhook] Evento: ${event} | Payment: ${payment?.id}`)

    // Só processa eventos de pagamento confirmado
    if (!EVENTOS_PAGOS.includes(event)) {
      return NextResponse.json({ received: true, action: 'ignored' })
    }

    // Buscar pedido pelo ID do Asaas ou pelo externalReference (nosso ID)
    const pedidoId = payment.externalReference
    if (!pedidoId) {
      console.warn('[webhook] Sem externalReference no pagamento')
      return NextResponse.json({ received: true, action: 'no_reference' })
    }

    const [pedido] = await db.select().from(pedidos).where(eq(pedidos.id, pedidoId))
    if (!pedido) {
      console.warn('[webhook] Pedido não encontrado:', pedidoId)
      return NextResponse.json({ received: true, action: 'pedido_not_found' })
    }

    // Evita processar duas vezes
    if (pedido.status === 'pago') {
      return NextResponse.json({ received: true, action: 'already_paid' })
    }

    // Atualizar pedido como pago
    await db.update(pedidos).set({
      status: 'pago',
      paidAt: new Date(),
    }).where(eq(pedidos.id, pedidoId))

    // Criar matrícula
    const [curso] = await db.select().from(cursos).where(eq(cursos.id, pedido.cursoId))
    
    let dataExpiracao: Date | null = null
    if (!curso.acessoVitalicio && curso.diasAcesso) {
      dataExpiracao = new Date()
      dataExpiracao.setDate(dataExpiracao.getDate() + curso.diasAcesso)
    }

    await db.insert(matriculas).values({
      alunoId: pedido.alunoId,
      cursoId: pedido.cursoId,
      pedidoId: pedido.id,
      status: 'ativo',
      dataExpiracao,
    }).onConflictDoNothing() // segurança contra duplicatas

    // Enviar e-mail de boas-vindas
    const [aluno] = await db.select().from(alunos).where(eq(alunos.id, pedido.alunoId))
    if (aluno && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'NBP Psicanálise <noreply@nbpsicanalise.com.br>',
        to: aluno.email,
        subject: `✅ Matrícula confirmada: ${curso.nome}`,
        html: emailBoasVindas({ aluno, curso }),
      }).catch(e => console.error('[webhook] Erro ao enviar email:', e))
    }

    console.log(`[webhook] ✅ Matrícula criada para aluno ${pedido.alunoId} no curso ${pedido.cursoId}`)
    return NextResponse.json({ received: true, action: 'matricula_created' })

  } catch (err) {
    console.error('[webhook] Erro:', err)
    // Sempre retorna 200 para o Asaas não retentar infinitamente
    return NextResponse.json({ received: true, error: 'internal_error' })
  }
}

function emailBoasVindas({
  aluno,
  curso,
}: {
  aluno: { nome: string; email: string }
  curso: { nome: string; slug: string }
}) {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#6a5a98,#4a3a78);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:400;letter-spacing:2px;">NBP PSICANÁLISE</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Formação em Psicanálise</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="color:#6a5a98;margin:0 0 16px;font-size:22px;">Sua matrícula foi confirmada! 🎉</h2>
          <p style="color:#444;line-height:1.7;margin:0 0 16px;">Olá, <strong>${aluno.nome}</strong>!</p>
          <p style="color:#444;line-height:1.7;margin:0 0 24px;">
            Sua inscrição no curso <strong style="color:#6a5a98;">${curso.nome}</strong> foi 
            confirmada com sucesso. Você já pode acessar o conteúdo na sua área do aluno.
          </p>
          <div style="background:#f8f6ff;border-left:4px solid #6a5a98;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
            <p style="margin:0;color:#333;font-size:14px;"><strong>Seu acesso:</strong></p>
            <p style="margin:4px 0 0;color:#555;font-size:14px;">Email: ${aluno.email}</p>
            <p style="margin:4px 0 0;color:#555;font-size:14px;">Use a senha que você criou no checkout.</p>
          </div>
          <table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding:8px 0 32px;">
            <a href="https://nbpsicanalise.com.br/minha-area" 
               style="background:#6a5a98;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;display:inline-block;letter-spacing:0.5px;">
              Acessar Minha Área
            </a>
          </td></tr></table>
          <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">
            Dúvidas? Fale conosco pelo WhatsApp ou responda este e-mail.<br>
            Equipe NBP Psicanálise
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:12px;margin:0;">
            © 2025 NBP Psicanálise — Núcleo Brasileiro de Psicanálise<br>
            São Paulo, SP — Tatuapé
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`
}
