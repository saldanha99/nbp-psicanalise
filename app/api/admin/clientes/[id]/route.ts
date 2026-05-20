import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import {
  getAlunoById,
  updateAluno,
  deleteAluno,
  getAlunoMatriculas,
  getAlunoPedidos,
  getAlunoRegistros,
} from '@/lib/db/queries/alunos'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const [aluno, matriculas, pedidos, registros] = await Promise.all([
    getAlunoById(id),
    getAlunoMatriculas(id),
    getAlunoPedidos(id),
    getAlunoRegistros(id),
  ])

  if (!aluno) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  return NextResponse.json({
    ...aluno,
    matriculas,
    pedidos,
    registros,
    // Aliases para retrocompatibilidade
    eventos: [],
    codigoAcesso: '',
    cashbackSaldo: '0.00',
    cashbackTotal: '0.00',
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const body = await request.json()
    const updated = await updateAluno(id, body)
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await deleteAluno(id)
  return NextResponse.json({ ok: true })
}
