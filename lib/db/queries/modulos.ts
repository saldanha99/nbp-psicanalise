import { db } from '../index'
import { modulos, aulas } from '../schema'
import { eq, asc } from 'drizzle-orm'

// ── Módulos ──────────────────────────────────────────────

export const getModulosByCurso = (cursoId: string) =>
  db.select().from(modulos)
    .where(eq(modulos.cursoId, cursoId))
    .orderBy(asc(modulos.ordem))

export const getModuloById = async (id: string) =>
  db.select().from(modulos).where(eq(modulos.id, id)).limit(1).then(r => r[0] ?? null)

export const createModulo = (data: typeof modulos.$inferInsert) =>
  db.insert(modulos).values(data).returning().then(r => r[0])

export const updateModulo = (id: string, data: Partial<typeof modulos.$inferInsert>) =>
  db.update(modulos).set(data).where(eq(modulos.id, id)).returning().then(r => r[0])

export const deleteModulo = (id: string) =>
  db.delete(modulos).where(eq(modulos.id, id))

// ── Aulas ────────────────────────────────────────────────

export const getAulasByModulo = (moduloId: string) =>
  db.select().from(aulas)
    .where(eq(aulas.moduloId, moduloId))
    .orderBy(asc(aulas.ordem))

export const getAulasByCurso = (cursoId: string) =>
  db.select().from(aulas)
    .where(eq(aulas.cursoId, cursoId))
    .orderBy(asc(aulas.ordem))

export const getAulaById = async (id: string) =>
  db.select().from(aulas).where(eq(aulas.id, id)).limit(1).then(r => r[0] ?? null)

export const createAula = (data: typeof aulas.$inferInsert) =>
  db.insert(aulas).values(data).returning().then(r => r[0])

export const updateAula = (id: string, data: Partial<typeof aulas.$inferInsert>) =>
  db.update(aulas).set(data).where(eq(aulas.id, id)).returning().then(r => r[0])

export const deleteAula = (id: string) =>
  db.delete(aulas).where(eq(aulas.id, id))

// ── Curso completo (módulos + aulas aninhadas) ───────────

export async function getCursoComModulosEAulas(cursoId: string) {
  const [todoModulos, todasAulas] = await Promise.all([
    getModulosByCurso(cursoId),
    getAulasByCurso(cursoId),
  ])

  return todoModulos.map(m => ({
    ...m,
    aulas: todasAulas.filter(a => a.moduloId === m.id).sort((a, b) => a.ordem - b.ordem),
  }))
}
