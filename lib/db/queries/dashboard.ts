import { db } from '../index'
import { leads, alunos, matriculas, pedidos, cursos } from '../schema'
import { eq, desc, gte, lt, not, inArray, and, count, sum, sql } from 'drizzle-orm'

export async function getDashboardMetrics() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const inicioMes   = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicio30d   = new Date(hoje.getTime() - 30 * 86400000)

  const [
    leadsHojeRes,
    leadsAbertosRes,
    alunosTotalRes,
    matriculasAtivasRes,
    receitaMesRes,
    leadsTotal30dRes,
    leadsConf30dRes,
    leadsPerdidosMesRes,
    topCursoRes,
    ultimasMatriculasRes,
    leadsPorStatusRes,
    origemLeadsRes,
    topCursosRes,
  ] = await Promise.all([
    // Leads criados hoje
    db.select({ n: count() }).from(leads)
      .where(gte(leads.createdAt, hoje))
      .then(r => Number(r[0].n)),

    // Leads em aberto (pipeline ativo)
    db.select({ n: count() }).from(leads)
      .where(not(inArray(leads.status, ['realizado', 'perdido'])))
      .then(r => Number(r[0].n)),

    // Total de Alunos
    db.select({ n: count() }).from(alunos)
      .then(r => Number(r[0].n)),

    // Matrículas ativas
    db.select({ n: count() }).from(matriculas)
      .where(eq(matriculas.status, 'ativo'))
      .then(r => Number(r[0].n)),

    // Receita do mês (pedidos pagos)
    db.select({ t: sum(pedidos.valor) }).from(pedidos)
      .where(and(eq(pedidos.status, 'pago'), gte(pedidos.createdAt, inicioMes)))
      .then(r => Number(r[0].t ?? 0)),

    // Leads total 30d (para taxa de conversão)
    db.select({ n: count() }).from(leads)
      .where(gte(leads.createdAt, inicio30d))
      .then(r => Number(r[0].n)),

    // Leads confirmados 30d
    db.select({ n: count() }).from(leads)
      .where(and(eq(leads.status, 'confirmado'), gte(leads.createdAt, inicio30d)))
      .then(r => Number(r[0].n)),

    // Leads perdidos no mês
    db.select({ n: count() }).from(leads)
      .where(and(eq(leads.status, 'perdido'), gte(leads.createdAt, inicioMes)))
      .then(r => Number(r[0].n)),

    // Top curso (por vendas)
    db.execute(sql`
      SELECT c.nome, COUNT(*)::int AS total
      FROM pedidos p
      JOIN cursos c ON c.id = p.curso_id
      WHERE p.status = 'pago'
      GROUP BY c.nome ORDER BY total DESC LIMIT 1
    `).then(r => r.rows[0] as { nome: string; total: number } | undefined),

    // Últimas matrículas (até 6)
    db.select({
      id: matriculas.id,
      alunoNome: alunos.nome,
      cursoNome: cursos.nome,
      status: matriculas.status,
      progressoPercent: matriculas.progressoPercent,
      createdAt: matriculas.createdAt,
    }).from(matriculas)
      .innerJoin(alunos, eq(matriculas.alunoId, alunos.id))
      .innerJoin(cursos, eq(matriculas.cursoId, cursos.id))
      .orderBy(desc(matriculas.createdAt))
      .limit(6),

    // Funil: leads por status (todos os leads)
    db.execute(sql`
      SELECT status, COUNT(*)::int AS total
      FROM leads
      GROUP BY status
    `).then(r => r.rows as { status: string; total: number }[]),

    // Origem dos leads (últimos 90 dias)
    db.execute(sql`
      SELECT COALESCE(origem, 'Direto') AS origem, COUNT(*)::int AS total
      FROM leads
      WHERE created_at >= NOW() - INTERVAL '90 days'
      GROUP BY origem ORDER BY total DESC LIMIT 6
    `).then(r => r.rows as { origem: string; total: number }[]),

    // Top 6 cursos mais vendidos
    db.execute(sql`
      SELECT c.nome, COUNT(*)::int AS total
      FROM pedidos p
      JOIN cursos c ON c.id = p.curso_id
      WHERE p.status = 'pago'
      GROUP BY c.nome ORDER BY total DESC LIMIT 6
    `).then(r => r.rows as { nome: string; total: number }[]),
  ])

  return {
    leadsHoje:          leadsHojeRes,
    leadsAbertos:       leadsAbertosRes,
    alunosTotal:        alunosTotalRes,
    matriculasAtivas:   matriculasAtivasRes,
    receitaMes:         receitaMesRes,
    taxaConversao:      leadsTotal30dRes > 0
                          ? Math.round((leadsConf30dRes / leadsTotal30dRes) * 100)
                          : 0,
    leadsPerdidosMes:   leadsPerdidosMesRes,
    topCurso:           topCursoRes ?? null,
    ultimasMatriculas:  ultimasMatriculasRes,
    leadsPorStatus:     leadsPorStatusRes,
    origemLeads:        origemLeadsRes,
    topCursos:          topCursosRes,
  }
}

