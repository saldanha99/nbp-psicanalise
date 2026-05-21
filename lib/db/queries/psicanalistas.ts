import { db } from '../index'
import { psicanalistas, pacientes } from '../schema'
import { eq, desc, sql } from 'drizzle-orm'

export async function getPsicanalistas() {
  try {
    // Retorna todos os psicanalistas com a contagem de pacientes ativos
    const list = await db
      .select({
        id: psicanalistas.id,
        nome: psicanalistas.nome,
        email: psicanalistas.email,
        telefone: psicanalistas.telefone,
        ativo: psicanalistas.ativo,
        createdAt: psicanalistas.createdAt,
        updatedAt: psicanalistas.updatedAt,
        totalPacientes: sql<number>`cast(count(${pacientes.id}) filter (where ${pacientes.status} = 'ativo') as integer)`,
      })
      .from(psicanalistas)
      .leftJoin(pacientes, eq(pacientes.psicanalistaId, psicanalistas.id))
      .groupBy(psicanalistas.id)
      .orderBy(desc(psicanalistas.createdAt))
    return list
  } catch (error) {
    console.error('Erro ao buscar psicanalistas:', error)
    return []
  }
}

export async function getPsicanalistaById(id: string) {
  const rows = await db.select().from(psicanalistas).where(eq(psicanalistas.id, id)).limit(1)
  return rows[0] ?? null
}

export async function createPsicanalista(data: {
  nome: string
  email: string
  telefone?: string | null
}) {
  return db.insert(psicanalistas).values({
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
  }).returning()
}

export async function updatePsicanalista(id: string, data: Partial<{
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
}>) {
  return db.update(psicanalistas)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(psicanalistas.id, id))
    .returning()
}

export async function deletePsicanalista(id: string) {
  return db.delete(psicanalistas).where(eq(psicanalistas.id, id))
}

// ── PACIENTES ───────────────────────────────────────────────

export async function getTodosPacientes() {
  try {
    const list = await db
      .select({
        id: pacientes.id,
        nome: pacientes.nome,
        email: pacientes.email,
        telefone: pacientes.telefone,
        cpf: pacientes.cpf,
        dataNascimento: pacientes.dataNascimento,
        status: pacientes.status,
        observacoes: pacientes.observacoes,
        createdAt: pacientes.createdAt,
        psicanalistaId: pacientes.psicanalistaId,
        psicanalistaNome: psicanalistas.nome,
      })
      .from(pacientes)
      .leftJoin(psicanalistas, eq(pacientes.psicanalistaId, psicanalistas.id))
      .orderBy(desc(pacientes.createdAt))
    return list
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error)
    return []
  }
}

export async function getPacientesByPsicanalista(psicanalistaId: string) {
  try {
    return await db
      .select()
      .from(pacientes)
      .where(eq(pacientes.psicanalistaId, psicanalistaId))
      .orderBy(desc(pacientes.createdAt))
  } catch (error) {
    console.error('Erro ao buscar pacientes por psicanalista:', error)
    return []
  }
}

export async function createPaciente(data: {
  psicanalistaId: string | null
  nome: string
  email?: string | null
  telefone?: string | null
  cpf?: string | null
  dataNascimento?: string | null
  status?: string
  observacoes?: string | null
}) {
  return db.insert(pacientes).values({
    psicanalistaId: data.psicanalistaId,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    cpf: data.cpf,
    dataNascimento: data.dataNascimento,
    status: data.status || 'ativo',
    observacoes: data.observacoes,
  }).returning()
}

export async function updatePaciente(id: string, data: Partial<{
  psicanalistaId: string | null
  nome: string
  email: string | null
  telefone: string | null
  cpf: string | null
  dataNascimento: string | null
  status: string
  observacoes: string | null
}>) {
  return db.update(pacientes)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(pacientes.id, id))
    .returning()
}

export async function deletePaciente(id: string) {
  return db.delete(pacientes).where(eq(pacientes.id, id))
}
