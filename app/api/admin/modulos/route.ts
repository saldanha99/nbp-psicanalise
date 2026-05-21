import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getModulosByCurso, createModulo } from '@/lib/db/queries/modulos'

// GET /api/admin/modulos?cursoId=xxx
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cursoId = req.nextUrl.searchParams.get('cursoId')
  if (!cursoId) return NextResponse.json({ error: 'cursoId obrigatório' }, { status: 400 })

  const data = await getModulosByCurso(cursoId)
  return NextResponse.json(data)
}

// POST /api/admin/modulos
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { cursoId, titulo, descricao, ordem } = body

    if (!cursoId || !titulo) {
      return NextResponse.json({ error: 'cursoId e titulo são obrigatórios' }, { status: 400 })
    }

    const modulo = await createModulo({
      cursoId,
      titulo,
      descricao: descricao || null,
      ordem: ordem ?? 0,
      ativo: true,
    })

    return NextResponse.json(modulo, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/modulos]', error)
    return NextResponse.json({ error: 'Erro ao criar módulo' }, { status: 500 })
  }
}
