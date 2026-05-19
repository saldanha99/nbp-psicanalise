import { getCursoById } from '@/lib/db/queries/cursos'
import { notFound } from 'next/navigation'
import { CourseForm } from '@/components/admin/CourseForm'
import { BackButton } from '@/components/admin/BackButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar Curso' }

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const curso = await getCursoById(id)
  if (!curso) notFound()

  return (
    <div className="p-6 pb-24 md:pb-10 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <BackButton href="/admin/cursos" />
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase">
          Editar: {curso.nome}
        </h1>
      </div>
      <CourseForm curso={curso} />
    </div>
  )
}
