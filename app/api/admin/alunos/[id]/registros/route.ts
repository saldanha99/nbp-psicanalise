import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAlunoRegistro, deleteAlunoRegistro } from '@/lib/db/queries/alunos'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: alunoId } = await params

  try {
    const body = await request.json()
    const { tipo, data, horas, supervisor, conteudo } = body

    if (!tipo || !conteudo) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes: tipo e conteudo' }, { status: 400 })
    }

    const newRegistro = await createAlunoRegistro({
      alunoId,
      tipo,
      data: data ? new Date(data) : new Date(),
      horas: horas ? Number(horas) : 0,
      supervisor: supervisor || null,
      conteudo,
    })

    return NextResponse.json(newRegistro, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao criar registro' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const registroId = searchParams.get('registroId')

    if (!registroId) {
      return NextResponse.json({ error: 'ID do registro ausente' }, { status: 400 })
    }

    await deleteAlunoRegistro(registroId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao remover registro' }, { status: 500 })
  }
}
