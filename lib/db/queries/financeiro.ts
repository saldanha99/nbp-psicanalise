import { db } from '../index'
import { pedidos, cursos, alunos } from '../schema'
import { eq, gte, lt, and, sum, count, sql, desc } from 'drizzle-orm'

export type MesAno = { mes: number; ano: number }

function mesRange(mes: number, ano: number) {
  const inicio = new Date(ano, mes - 1, 1)
  const fim = new Date(ano, mes, 1)
  return { inicio, fim }
}

export async function getKpisMes(mes: number, ano: number) {
  const { inicio, fim } = mesRange(mes, ano)

  const [totalFaturado, totalVendas, cursosVendidos] = await Promise.all([
    // Total Faturado
    db.select({ t: sum(pedidos.valor) })
      .from(pedidos)
      .where(and(
        eq(pedidos.status, 'pago'),
        gte(pedidos.createdAt, inicio),
        lt(pedidos.createdAt, fim)
      ))
      .then(r => Number(r[0].t ?? 0)),

    // Total de Vendas (Pedidos Pagos)
    db.select({ n: count() })
      .from(pedidos)
      .where(and(
        eq(pedidos.status, 'pago'),
        gte(pedidos.createdAt, inicio),
        lt(pedidos.createdAt, fim)
      ))
      .then(r => Number(r[0].n)),

    // Quantidade total de inscrições (pedidos pagos)
    db.select({ n: count() })
      .from(pedidos)
      .where(and(
        eq(pedidos.status, 'pago'),
        gte(pedidos.createdAt, inicio),
        lt(pedidos.createdAt, fim)
      ))
      .then(r => Number(r[0].n)),
  ])

  const ticketMedioVendas = totalVendas > 0 ? totalFaturado / totalVendas : 0

  return {
    totalFaturado,
    totalFestas: totalVendas, // alias para manter retrocompatibilidade com UI
    cursosAlugados: cursosVendidos, // alias para manter retrocompatibilidade com UI
    ticketMedioFestas: ticketMedioVendas,
    ticketMedioCursos: ticketMedioVendas,
  }
}

export async function getReceitaPorMes(ano: number) {
  const rows = await db.execute(sql`
    SELECT
      EXTRACT(MONTH FROM created_at)::int AS mes,
      COALESCE(SUM(valor), 0)::float AS receita,
      COUNT(*)::int AS vendas
    FROM pedidos
    WHERE status = 'pago'
      AND EXTRACT(YEAR FROM created_at) = ${ano}
    GROUP BY mes
    ORDER BY mes
  `)
  const map: Record<number, { receita: number; vendas: number }> = {}
  for (const r of rows.rows as { mes: number; receita: number; vendas: number }[]) {
    map[r.mes] = { receita: r.receita, vendas: r.vendas }
  }
  return Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    receita: map[i + 1]?.receita ?? 0,
    festas: map[i + 1]?.vendas ?? 0, // manter o nome da propriedade para retrocompatibilidade
  }))
}

export async function getRankingCursosMes(mes: number, ano: number) {
  const { inicio, fim } = mesRange(mes, ano)
  const rows = await db.execute(sql`
    SELECT c.nome, COUNT(*)::int AS alugados,
           COALESCE(SUM(p.valor), 0)::float AS receita
    FROM pedidos p
    JOIN cursos c ON c.id = p.curso_id
    WHERE p.status = 'pago'
      AND p.created_at >= ${inicio}
      AND p.created_at < ${fim}
    GROUP BY c.nome
    ORDER BY alugados DESC
    LIMIT 10
  `)
  return rows.rows as { nome: string; alugados: number; receita: number }[]
}

export async function getOrigemClientesMes(mes: number, ano: number) {
  // Retorna vazio pois não se aplica ao LMS de forma direta
  return []
}

// Representa a lista de pedidos do mês
export async function getEventosMes(mes: number, ano: number) {
  const { inicio, fim } = mesRange(mes, ano)
  
  const rows = await db
    .select({
      id: pedidos.id,
      alunoNome: alunos.nome,
      cursoNome: cursos.nome,
      valor: pedidos.valor,
      formaPagamento: pedidos.formaPagamento,
      status: pedidos.status,
      createdAt: pedidos.createdAt,
    })
    .from(pedidos)
    .innerJoin(alunos, eq(pedidos.alunoId, alunos.id))
    .innerJoin(cursos, eq(pedidos.cursoId, cursos.id))
    .where(and(
      gte(pedidos.createdAt, inicio),
      lt(pedidos.createdAt, fim)
    ))
    .orderBy(desc(pedidos.createdAt))

  return rows.map(r => ({
    id: r.id,
    nomeCliente: r.alunoNome,
    dataEvento: r.createdAt.toISOString().slice(0, 10),
    horarioInicio: r.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    valorTotal: r.valor,
    custoMonitores: '0',
    custoTransporte: '0',
    custosExtras: '0',
    status: r.status === 'pago' ? 'realizado' : r.status === 'cancelado' ? 'cancelado' : 'confirmado',
    statusPagamento: r.status === 'pago' ? 'pago' : 'pendente',
    origemCliente: r.cursoNome, // usar nome do curso no lugar da origem
    tipoCliente: r.formaPagamento,
  }))
}
