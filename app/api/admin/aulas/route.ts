import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAulasByCurso, getAulasByModulo, createAula } from '@/lib/db/queries/modulos'

// GET /api/admin/aulas?cursoId=xxx  ou  ?moduloId=xxx
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cursoId = req.nextUrl.searchParams.get('cursoId')
  const moduloId = req.nextUrl.searchParams.get('moduloId')

  if (!cursoId && !moduloId) {
    return NextResponse.json({ error: 'cursoId ou moduloId obrigatório' }, { status: 400 })
  }

  const data = moduloId
    ? await getAulasByModulo(moduloId)
    : await getAulasByCurso(cursoId!)

  return NextResponse.json(data)
}

// POST /api/admin/aulas
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      moduloId, cursoId, titulo, descricao, ordem,
      tipo, videoUrl, videoProvider, videoDuracao,
      materialUrl, conteudoTexto, gratuita,
    } = body

    if (!moduloId || !cursoId || !titulo) {
      return NextResponse.json(
        { error: 'moduloId, cursoId e titulo são obrigatórios' },
        { status: 400 }
      )
    }

    const aula = await createAula({
      moduloId,
      cursoId,
      titulo,
      descricao: descricao || null,
      ordem: ordem ?? 0,
      tipo: tipo ?? 'video',
      videoUrl: videoUrl || null,
      videoProvider: videoProvider ?? 'blob',
      videoDuracao: videoDuracao || null,
      materialUrl: materialUrl || null,
      conteudoTexto: conteudoTexto || null,
      gratuita: gratuita ?? false,
      ativo: true,
    })

    return NextResponse.json(aula, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/aulas]', error)
    return NextResponse.json({ error: 'Erro ao criar aula' }, { status: 500 })
  }
}
