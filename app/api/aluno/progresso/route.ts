import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { progressoAluno, aulas, matriculas } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'nbp-aluno-secret-fallback')

async function getAlunoId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('aluno_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload.sub as string
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const alunoId = await getAlunoId(req)
  if (!alunoId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { aulaId, cursoId, percentualAssistido, ultimoSegundo, concluida } = await req.json()

  if (!aulaId || !cursoId) {
    return NextResponse.json({ error: 'aulaId e cursoId obrigatórios' }, { status: 400 })
  }

  // Upsert do progresso
  const agora = new Date()
  const [existente] = await db.select().from(progressoAluno)
    .where(and(eq(progressoAluno.alunoId, alunoId), eq(progressoAluno.aulaId, aulaId)))

  if (existente) {
    const jaConcluidaAntes = existente.concluida
    await db.update(progressoAluno).set({
      percentualAssistido: Math.max(existente.percentualAssistido, percentualAssistido ?? 0),
      ultimoSegundo: ultimoSegundo ?? existente.ultimoSegundo,
      concluida: jaConcluidaAntes || Boolean(concluida),
      concluidaAt: (!jaConcluidaAntes && concluida) ? agora : existente.concluidaAt,
      updatedAt: agora,
    }).where(eq(progressoAluno.id, existente.id))
  } else {
    await db.insert(progressoAluno).values({
      alunoId,
      aulaId,
      cursoId,
      percentualAssistido: percentualAssistido ?? 0,
      ultimoSegundo: ultimoSegundo ?? 0,
      concluida: Boolean(concluida),
      concluidaAt: concluida ? agora : null,
    })
  }

  // Recalcular progresso total do curso
  const [{ totalAulas }] = await db.select({ totalAulas: count() })
    .from(aulas)
    .where(and(eq(aulas.cursoId, cursoId), eq(aulas.ativo, true)))

  const [{ aulasConc }] = await db.select({ aulasConc: count() })
    .from(progressoAluno)
    .where(and(
      eq(progressoAluno.alunoId, alunoId),
      eq(progressoAluno.cursoId, cursoId),
      eq(progressoAluno.concluida, true)
    ))

  const percentualCurso = totalAulas > 0
    ? Math.round((Number(aulasConc) / Number(totalAulas)) * 100)
    : 0

  // Atualizar progresso na matrícula
  const updateMatricula: Record<string, unknown> = {
    progressoPercent: percentualCurso,
    ultimoAcessoAt: agora,
  }

  // Gerar certificado se 100%
  if (percentualCurso === 100) {
    updateMatricula.certificadoAt = agora
    // TODO: gerar PDF certificado e salvar URL
  }

  await db.update(matriculas).set(updateMatricula)
    .where(and(
      eq(matriculas.alunoId, alunoId),
      eq(matriculas.cursoId, cursoId)
    ))

  return NextResponse.json({ ok: true, progressoCurso: percentualCurso })
}
