import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pedidos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { consultarPagamento } from '@/lib/asaas'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pedidoId: string }> }
) {
  const { pedidoId } = await params

  const [pedido] = await db.select().from(pedidos).where(eq(pedidos.id, pedidoId))
  if (!pedido) {
    return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  }

  // Se já pago no nosso DB, retorna direto
  if (pedido.status === 'pago') {
    return NextResponse.json({ status: 'pago', paidAt: pedido.paidAt })
  }

  // Consulta status atualizado no Asaas
  if (pedido.asaasPaymentId) {
    try {
      const cobranca = await consultarPagamento(pedido.asaasPaymentId)
      return NextResponse.json({
        status: pedido.status,
        asaasStatus: cobranca.status,
        pago: ['CONFIRMED', 'RECEIVED'].includes(cobranca.status),
      })
    } catch {
      // Retorna status local se falhar consulta
    }
  }

  return NextResponse.json({ status: pedido.status, pago: false })
}
