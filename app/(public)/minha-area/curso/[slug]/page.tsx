import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { matriculas, cursos, modulos, aulas, progressoAluno } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import Link from 'next/link'
import { CoursePlayerClient } from './CoursePlayerClient'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'nbp-aluno-secret-fallback')

async function getAluno() {
  const cookieStore = await cookies()
  const token = cookieStore.get('aluno_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return { id: payload.sub as string, nome: payload.nome as string }
  } catch { return null }
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CursoPlayerPage({ params }: Props) {
  const { slug } = await params
  const aluno = await getAluno()
  if (!aluno) redirect('/minha-area/auth/login')

  const [curso] = await db.select().from(cursos).where(eq(cursos.slug, slug))
  if (!curso) notFound()

  // Verificar matrícula
  const [matricula] = await db.select().from(matriculas)
    .where(and(
      eq(matriculas.alunoId, aluno.id),
      eq(matriculas.cursoId, curso.id),
      eq(matriculas.status, 'ativo')
    ))
  if (!matricula) redirect('/minha-area')

  // Buscar estrutura do curso
  const modulosList = await db.select().from(modulos)
    .where(and(eq(modulos.cursoId, curso.id), eq(modulos.ativo, true)))
    .orderBy(asc(modulos.ordem))

  const aulasList = await db.select().from(aulas)
    .where(and(eq(aulas.cursoId, curso.id), eq(aulas.ativo, true)))
    .orderBy(asc(aulas.ordem))

  const progressoList = await db.select().from(progressoAluno)
    .where(and(eq(progressoAluno.alunoId, aluno.id), eq(progressoAluno.cursoId, curso.id)))

  const progressoMap = Object.fromEntries(progressoList.map(p => [p.aulaId, p]))

  return (
    <CoursePlayerClient
      aluno={aluno}
      curso={{
        id: curso.id,
        nome: curso.nome,
        slug: curso.slug,
        certificado: curso.certificado,
        cargaHoraria: curso.cargaHoraria,
      }}
      matricula={{
        id: matricula.id,
        progressoPercent: matricula.progressoPercent,
        certificadoUrl: matricula.certificadoUrl,
        certificadoAt: matricula.certificadoAt?.toISOString() ?? null,
      }}
      modulos={modulosList.map(m => ({
        id: m.id,
        titulo: m.titulo,
        aulas: aulasList.filter(a => a.moduloId === m.id).map(a => ({
          id: a.id,
          titulo: a.titulo,
          tipo: a.tipo,
          videoUrl: a.videoUrl,
          videoProvider: a.videoProvider,
          videoDuracao: a.videoDuracao,
          gratuita: a.gratuita,
          concluida: progressoMap[a.id]?.concluida ?? false,
          ultimoSegundo: progressoMap[a.id]?.ultimoSegundo ?? 0,
        })),
      }))}
    />
  )
}
