import type { Metadata } from 'next'
import { CourseForm } from '@/components/admin/CourseForm'
import { BackButton } from '@/components/admin/BackButton'

export const metadata: Metadata = { title: 'Novo Curso' }

export default function NovoCursoPage() {
  return (
    <div className="p-6 pb-24 md:pb-10 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <BackButton href="/admin/cursos" />
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white uppercase">
          Novo Curso
        </h1>
      </div>
      <CourseForm />
    </div>
  )
}
