'use client'

import { cn } from '@/lib/utils'

interface Category {
  value: string
  label: string
}

interface Props {
  onFilter: (categoria: string) => void
  categoriaAtiva: string
  categorias: Category[]
}

export function CategoryFilter({ onFilter, categoriaAtiva, categorias }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categorias.map((cat) => {
        const isActive = cat.value === categoriaAtiva
        return (
          <button
            key={cat.value}
            onClick={() => onFilter(cat.value)}
            className={cn(
              'px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 border',
              isActive
                ? 'bg-[#6a5a98] text-white border-[#6a5a98] shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:text-[#6a5a98] hover:border-[#6a5a98]',
            )}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
