import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getAlunoById,
  getAlunoMatriculas,
  getAlunoPedidos,
  getAlunoRegistros,
} from '@/lib/db/queries/alunos'
import { ClienteDetailClient } from '@/components/admin/ClienteDetailClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const c = await getAlunoById(id)
  return { title: c ? `Aluno — ${c.nome}` : 'Aluno' }
}

async function ClienteDetailContent({ id }: { id: string }) {
  const [aluno, matriculas, pedidos, registros] = await Promise.all([
    getAlunoById(id),
    getAlunoMatriculas(id),
    getAlunoPedidos(id),
    getAlunoRegistros(id),
  ])
  if (!aluno) notFound()

  const clienteData = {
    ...aluno,
    matriculas,
    pedidos,
    registros,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ClienteDetailClient cliente={clienteData as any} />
}

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <div className="h-8 w-64 bg-brand-surface-2 rounded-xl animate-pulse" />
        <div className="h-48 bg-brand-surface rounded-2xl border border-brand-border animate-pulse" />
      </div>
    }>
      <ClienteDetailContent id={id} />
    </Suspense>
  )
}
