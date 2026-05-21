import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updatePsicanalista, deletePsicanalista } from '@/lib/db/queries/psicanalistas'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const [updated] = await updatePsicanalista(id, {
      nome: body.nome,
      email: body.email,
      telefone: body.telefone !== undefined ? body.telefone : undefined,
      ativo: body.ativo !== undefined ? body.ativo : undefined,
    })
    if (!updated) {
      return NextResponse.json({ error: 'Psicanalista não encontrado' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro no PATCH de psicanalista:', error)
    return NextResponse.json({ error: 'Erro ao atualizar psicanalista' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await deletePsicanalista(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no DELETE de psicanalista:', error)
    return NextResponse.json({ error: 'Erro ao excluir psicanalista' }, { status: 500 })
  }
}
