'use client'

import { useState, useMemo } from 'react'
import { type Curso } from '@/types'
import { CategoryFilter } from './CategoryFilter'
import { CourseCard } from './CourseCard'

interface Props {
  cursos: Curso[]
}

function formatCategoryLabel(value: string) {
  if (value === 'todos') return 'Todos'
  // Format slug-like categories or keep as is
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function CourseGrid({ cursos }: Props) {
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos')

  // Compute dynamic categories based on available courses
  const categorias = useMemo(() => {
    const cats = new Set(cursos.map((c) => c.categoria).filter(Boolean))
    const list = Array.from(cats).map((c) => ({
      value: c,
      label: formatCategoryLabel(c),
    }))
    return [{ value: 'todos', label: 'Todos' }, ...list]
  }, [cursos])

  const filtered = useMemo(() => {
    if (categoriaAtiva === 'todos') return cursos
    return cursos.filter((b) => b.categoria === categoriaAtiva)
  }, [cursos, categoriaAtiva])

  return (
    <div className="flex flex-col gap-6">
      <CategoryFilter
        onFilter={setCategoriaAtiva}
        categoriaAtiva={categoriaAtiva}
        categorias={categorias}
      />

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400 bg-white border border-gray-150 rounded-lg shadow-sm">
          Nenhum curso encontrado para esta categoria.
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300"
          key={categoriaAtiva}
        >
          {filtered.map((curso) => (
            <div key={curso.id} className="animate-in fade-in duration-300">
              <CourseCard curso={curso} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
