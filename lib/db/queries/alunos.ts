import { db } from '../index'
import { alunos, matriculas, cursos, pedidos, alunoRegistros } from '../schema'
import { eq, desc, ilike, or, and } from 'drizzle-orm'

export type AlunoInsert = typeof alunos.$inferInsert
export type RegistroInsert = typeof alunoRegistros.$inferInsert

// ── Lista de Alunos (Portal EAD) ──
export async function getAlunos(search?: string) {
  const query = db.select().from(alunos)
  if (search) {
    const searchPattern = `%${search}%`
    return query.where(
      or(
        ilike(alunos.nome, searchPattern),
        ilike(alunos.email, searchPattern),
        ilike(alunos.telefone ?? '', searchPattern),
        ilike(alunos.cpf ?? '', searchPattern)
      )
    ).orderBy(desc(alunos.createdAt))
  }
  return query.orderBy(desc(alunos.createdAt))
}

// ── Aluno por ID ──
export async function getAlunoById(id: string) {
  const [aluno] = await db.select().from(alunos).where(eq(alunos.id, id))
  return aluno ?? null
}

// ── Matrículas de um Aluno ──
export async function getAlunoMatriculas(alunoId: string) {
  return db
    .select({
      id: matriculas.id,
      status: matriculas.status,
      progressoPercent: matriculas.progressoPercent,
      certificadoUrl: matriculas.certificadoUrl,
      certificadoAt: matriculas.certificadoAt,
      ultimoAcessoAt: matriculas.ultimoAcessoAt,
      createdAt: matriculas.createdAt,
      cursoId: cursos.id,
      cursoNome: cursos.nome,
      cursoSlug: cursos.slug,
      cargaHoraria: cursos.cargaHoraria,
      temCertificado: cursos.certificado,
    })
    .from(matriculas)
    .innerJoin(cursos, eq(matriculas.cursoId, cursos.id))
    .where(eq(matriculas.alunoId, alunoId))
    .orderBy(desc(matriculas.createdAt))
}

// ── Pedidos / Pagamentos de um Aluno ──
export async function getAlunoPedidos(alunoId: string) {
  return db
    .select({
      id: pedidos.id,
      valor: pedidos.valor,
      formaPagamento: pedidos.formaPagamento,
      parcelas: pedidos.parcelas,
      status: pedidos.status,
      paidAt: pedidos.paidAt,
      createdAt: pedidos.createdAt,
      cursoNome: cursos.nome,
      asaasPaymentLink: pedidos.asaasPaymentLink,
    })
    .from(pedidos)
    .innerJoin(cursos, eq(pedidos.cursoId, cursos.id))
    .where(eq(pedidos.alunoId, alunoId))
    .orderBy(desc(pedidos.createdAt))
}

// ── Registros de Supervisão / Anotações do Aluno ──
export async function getAlunoRegistros(alunoId: string) {
  return db
    .select()
    .from(alunoRegistros)
    .where(eq(alunoRegistros.alunoId, alunoId))
    .orderBy(desc(alunoRegistros.data))
}

// ── Adicionar Registro de Supervisão / Parecer ──
export async function createAlunoRegistro(data: RegistroInsert) {
  const [registro] = await db.insert(alunoRegistros).values(data).returning()
  return registro
}

// ── Remover Registro de Supervisão ──
export async function deleteAlunoRegistro(id: string) {
  const [removed] = await db.delete(alunoRegistros).where(eq(alunoRegistros.id, id)).returning()
  return removed ?? null
}

// ── CRUD Aluno ──
export const createAluno = (data: AlunoInsert) =>
  db.insert(alunos).values(data).returning().then(r => r[0])

export const updateAluno = (id: string, data: Partial<AlunoInsert>) =>
  db.update(alunos).set({ ...data, updatedAt: new Date() }).where(eq(alunos.id, id)).returning().then(r => r[0])

export const deleteAluno = (id: string) =>
  db.delete(alunos).where(eq(alunos.id, id))
