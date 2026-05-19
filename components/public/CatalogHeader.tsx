'use client'

import { BookOpen } from 'lucide-react'

interface CatalogHeaderProps {
  totalCourses: number
}

export function CatalogHeader({ totalCourses }: CatalogHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden bg-white border border-gray-150 rounded-lg mb-12 flex items-center min-h-[250px] shadow-sm">
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #6a5a98 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center">
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 bg-[#6a5a98]/10 border border-[#6a5a98]/20 text-[#6a5a98] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded mb-6">
          <BookOpen className="w-4 h-4" />
          <span>Nossos Cursos</span>
        </div>

        <h1 className="font-bold text-gray-900 leading-tight tracking-tight mb-4 uppercase text-3xl md:text-5xl font-[family-name:var(--font-heading)]">
          Formações & Cursos Livres
        </h1>

        <p className="text-gray-500 text-base md:text-lg font-light max-w-xl">
          {totalCourses} cursos disponíveis para o seu desenvolvimento contínuo e aprofundado na Psicanálise.
        </p>
      </div>
    </div>
  )
}
