import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getTodosPacientes, createPaciente } from '@/lib/db/queries/psicanalistas'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const list = await getTodosPacientes()
    return NextResponse.json(list)
  } catch (error) {
    console.error('Erro no GET de pacientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar pacientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    if (!body.nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }
    const [novo] = await createPaciente({
      psicanalistaId: body.psicanalistaId || null,
      nome: body.nome,
      email: body.email || null,
      telefone: body.telefone || null,
      cpf: body.cpf || null,
      dataNascimento: body.dataNascimento || null,
      status: body.status || 'ativo',
      observacoes: body.observacoes || null,
    })
    return NextResponse.json(novo, { status: 201 })
  } catch (error) {
    console.error('Erro no POST de pacientes:', error)
    return NextResponse.json({ error: 'Erro ao criar paciente' }, { status: 500 })
  }
}
