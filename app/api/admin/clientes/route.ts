import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAlunos, createAluno } from '@/lib/db/queries/alunos'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') ?? undefined
  const data = await getAlunos(search)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    // Forçar senha fallback se não vier no body (para novos alunos cadastrados manualmente)
    const data = {
      ...body,
      senhaHash: body.senhaHash || '$2a$10$3z8H.B0T0PpyuYvP6gE3u.qG/KxXjLphHwqXbYf.x8H3.34K9p12u', // nbp123 fallback
    }
    const aluno = await createAluno(data)
    return NextResponse.json(aluno, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao criar aluno' }, { status: 500 })
  }
}
