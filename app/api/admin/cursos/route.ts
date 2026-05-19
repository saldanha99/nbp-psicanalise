import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAllCursosAdmin, createCurso } from '@/lib/db/queries/cursos'
import { cursoSchema } from '@/lib/validations/course'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const cursos = await getAllCursosAdmin()
  return NextResponse.json(cursos)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = cursoSchema.parse(body)
    const curso = await createCurso(data)
    return NextResponse.json(curso, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/cursos]', error)
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
}
