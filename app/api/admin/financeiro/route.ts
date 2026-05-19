import { NextRequest, NextResponse } from 'next/server'
import { getKpisMes, getRankingCursosMes, getOrigemClientesMes, getEventosMes } from '@/lib/db/queries/financeiro'

export async function GET(req: NextRequest) {
  const mes = parseInt(req.nextUrl.searchParams.get('mes') ?? '1')
  const ano = parseInt(req.nextUrl.searchParams.get('ano') ?? String(new Date().getFullYear()))

  const [kpis, eventos, ranking, origens] = await Promise.all([
    getKpisMes(mes, ano),
    getEventosMes(mes, ano),
    getRankingCursosMes(mes, ano),
    getOrigemClientesMes(mes, ano),
  ])

  return NextResponse.json({ kpis, eventos, ranking, origens })
}
