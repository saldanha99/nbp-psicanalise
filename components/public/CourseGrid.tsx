'use client'

import { useState, useMemo } from 'react'
import { type Curso } from '@/types'
import { CategoryFilter } from './CategoryFilter'
import { CourseCard } from './CourseCard'

interface Props {
  cursos: Curso[]
}

export function CourseGrid({ cursos }: Props) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')

  const filtered = useMemo(() => {
    if (categoriaAtiva === 'todos') return cursos
    return cursos.filter((b) => b.categoria === categoriaAtiva)
  }, [cursos, categoriaAtiva])

  return (
    <div className="flex flex-col gap-8">
      <CategoryFilter onFilter={setCategoriaAtiva} categoriaAtiva={categoriaAtiva} />

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-brand-muted">
          Nenhum curso encontrado para esta categoria.
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300"
          key={categoriaAtiva}
        >
          {filtered.map((curso) => (
            <div key={curso.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CourseCard curso={curso} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
