import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { matriculas, cursos, progressoAluno, aulas } from '@/lib/db/schema'
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

export async function GET(req: NextRequest) {
  const alunoId = await getAlunoId(req)
  if (!alunoId) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  // Buscar matrículas ativas com info do curso
  const minhasMatriculas = await db
    .select({
      matriculaId: matriculas.id,
      status: matriculas.status,
      progressoPercent: matriculas.progressoPercent,
      ultimoAcessoAt: matriculas.ultimoAcessoAt,
      dataExpiracao: matriculas.dataExpiracao,
      certificadoUrl: matriculas.certificadoUrl,
      createdAt: matriculas.createdAt,
      // Curso
      cursoId: cursos.id,
      cursoNome: cursos.nome,
      cursoSlug: cursos.slug,
      cursoFoto: cursos.fotoDestaque,
      cursoCategoria: cursos.categoria,
      cargaHoraria: cursos.cargaHoraria,
    })
    .from(matriculas)
    .innerJoin(cursos, eq(matriculas.cursoId, cursos.id))
    .where(and(eq(matriculas.alunoId, alunoId), eq(matriculas.status, 'ativo')))

  return NextResponse.json({ matriculas: minhasMatriculas })
}
