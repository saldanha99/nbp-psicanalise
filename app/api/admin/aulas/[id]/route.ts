import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAulaById, updateAula, deleteAula } from '@/lib/db/queries/modulos'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/admin/aulas/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const updated = await updateAula(id, body)
    if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/admin/aulas/id]', error)
    return NextResponse.json({ error: 'Erro ao atualizar aula' }, { status: 500 })
  }
}

// DELETE /api/admin/aulas/[id]
// Remove o registro do banco. O arquivo de vídeo no HostGator
// pode ser removido manualmente via cPanel ou FTP se necessário.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const aula = await getAulaById(id)
  if (!aula) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await deleteAula(id)

  return NextResponse.json({
    success: true,
    videoUrl: aula.videoUrl ?? null,
    // Informa se havia um vídeo hospedado (para exibir msg ao admin se necessário)
    videoRemoved: false,
    hint: aula.videoUrl
      ? 'O arquivo de vídeo no servidor não foi removido automaticamente. Remova manualmente via cPanel se necessário.'
      : null,
  })
}
