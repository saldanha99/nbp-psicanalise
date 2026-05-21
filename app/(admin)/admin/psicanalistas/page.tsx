import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPsicanalistas, getTodosPacientes } from '@/lib/db/queries/psicanalistas'
import { PsicanalistasClient } from '@/components/admin/PsicanalistasClient'

export const metadata: Metadata = { title: 'Psicanalistas & Pacientes' }
export const dynamic = 'force-dynamic'

async function PsicanalistasContent() {
  const [psicanalistasData, pacientesData] = await Promise.all([
    getPsicanalistas(),
    getTodosPacientes(),
  ])

  return (
    <PsicanalistasClient
      psicanalistas={psicanalistasData as any[]}
      pacientes={pacientesData as any[]}
    />
  )
}

export default function PsicanalistasPage() {
  return (
    <Suspense fallback={
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-brand-surface-2 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-brand-surface rounded-2xl border border-brand-border animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <PsicanalistasContent />
    </Suspense>
  )
}
