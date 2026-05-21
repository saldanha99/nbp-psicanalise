import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updateModulo, deleteModulo, getModuloById } from '@/lib/db/queries/modulos'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/admin/modulos/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()
    const updated = await updateModulo(id, body)
    if (!updated) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/admin/modulos/id]', error)
    return NextResponse.json({ error: 'Erro ao atualizar módulo' }, { status: 500 })
  }
}

// DELETE /api/admin/modulos/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const existing = await getModuloById(id)
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await deleteModulo(id)
  return NextResponse.json({ success: true })
}
