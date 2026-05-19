import { db } from '../index'
import { cursos } from '../schema'
import { eq, and, asc, desc } from 'drizzle-orm'

export const getCursosAtivos = () =>
  db.select().from(cursos).where(eq(cursos.ativo, true)).orderBy(asc(cursos.nome))

export const getCursosDestaque = () =>
  db.select().from(cursos)
    .where(and(eq(cursos.ativo, true), eq(cursos.destaque, true)))
    .orderBy(asc(cursos.ordemDestaque))

export const getCursoBySlug = async (slug: string) =>
  db.select().from(cursos)
    .where(and(eq(cursos.slug, slug), eq(cursos.ativo, true)))
    .limit(1).then(r => r[0] ?? null)

export const getCursoById = async (id: string) =>
  db.select().from(cursos).where(eq(cursos.id, id)).limit(1).then(r => r[0] ?? null)

export const getAllCursosAdmin = () =>
  db.select().from(cursos).orderBy(asc(cursos.nome))

export const toggleDestaque = (id: string, value: boolean) =>
  db.update(cursos).set({ destaque: value, updatedAt: new Date() }).where(eq(cursos.id, id))

export const toggleAtivo = (id: string, value: boolean) =>
  db.update(cursos).set({ ativo: value, updatedAt: new Date() }).where(eq(cursos.id, id))

export const createCurso = (data: typeof cursos.$inferInsert) =>
  db.insert(cursos).values(data).returning().then(r => r[0])

export const updateCurso = (id: string, data: Partial<typeof cursos.$inferInsert>) =>
  db.update(cursos).set({ ...data, updatedAt: new Date() }).where(eq(cursos.id, id)).returning().then(r => r[0])

export const deleteCurso = (id: string) =>
  db.delete(cursos).where(eq(cursos.id, id))

export const getCursosByCategoria = (categoria: string) =>
  db.select().from(cursos)
    .where(and(eq(cursos.ativo, true), eq(cursos.categoria, categoria)))
    .orderBy(asc(cursos.nome))
