import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updatePaciente, deletePaciente } from '@/lib/db/queries/psicanalistas'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const [updated] = await updatePaciente(id, {
      psicanalistaId: body.psicanalistaId !== undefined ? body.psicanalistaId : undefined,
      nome: body.nome !== undefined ? body.nome : undefined,
      email: body.email !== undefined ? body.email : undefined,
      telefone: body.telefone !== undefined ? body.telefone : undefined,
      cpf: body.cpf !== undefined ? body.cpf : undefined,
      dataNascimento: body.dataNascimento !== undefined ? body.dataNascimento : undefined,
      status: body.status !== undefined ? body.status : undefined,
      observacoes: body.observacoes !== undefined ? body.observacoes : undefined,
    })
    if (!updated) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro no PATCH de paciente:', error)
    return NextResponse.json({ error: 'Erro ao atualizar paciente' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await deletePaciente(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro no DELETE de paciente:', error)
    return NextResponse.json({ error: 'Erro ao excluir paciente' }, { status: 500 })
  }
}
