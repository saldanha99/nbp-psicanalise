import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getPsicanalistas, createPsicanalista } from '@/lib/db/queries/psicanalistas'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const list = await getPsicanalistas()
    return NextResponse.json(list)
  } catch (error) {
    console.error('Erro no GET de psicanalistas:', error)
    return NextResponse.json({ error: 'Erro ao buscar psicanalistas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    if (!body.nome || !body.email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }
    const [novo] = await createPsicanalista({
      nome: body.nome,
      email: body.email,
      telefone: body.telefone || null,
    })
    return NextResponse.json(novo, { status: 201 })
  } catch (error) {
    console.error('Erro no POST de psicanalistas:', error)
    return NextResponse.json({ error: 'Erro ao criar psicanalista' }, { status: 500 })
  }
}
