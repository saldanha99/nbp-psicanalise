'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  curso: {
    id: string
    nome: string
    slug: string
    categoria: string
    faixaEtaria: string
    capacidade: string
    fotos: string[] | null
    fotoDestaque: string | null
    destaque: boolean
    dimensoes: string
    descricao: string | null
  }
}

export function CourseCard({ curso }: CourseCardProps) {
  const { nome, slug, categoria, fotos, fotoDestaque, destaque, descricao } = curso
  const imageSrc = fotoDestaque ?? (fotos && fotos.length > 0 ? fotos[0] : null)

  return (
    <div
      className={cn(
        'bg-white rounded-lg overflow-hidden flex flex-col transition-all duration-200 group border border-gray-150 hover:border-[#6a5a98] shadow-sm'
      )}
    >
      {/* Imagem */}
      <Link href={`/cursos/${slug}`} className="relative aspect-[4/3] bg-gray-50 overflow-hidden block">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Sem foto</span>
          </div>
        )}

        <div className="absolute top-3 left-3 z-10">
          <span className="bg-white/90 backdrop-blur-sm text-[#6a5a98] text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-gray-200">
            {categoria}
          </span>
        </div>

        {destaque && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-[#6a5a98] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              DESTAQUE
            </span>
          </div>
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-col gap-2.5 p-4 flex-1">
        <Link href={`/cursos/${slug}`}>
          <h3 className="text-gray-900 font-bold text-base leading-snug group-hover:text-[#6a5a98] transition-colors uppercase font-[family-name:var(--font-heading)]">
            {nome}
          </h3>
        </Link>

        {descricao && (
          <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-light">
            {descricao}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          <Link
            href={`/cursos/${slug}`}
            className="w-full inline-flex items-center justify-center bg-[#6a5a98] hover:bg-[#584885] text-white font-bold text-[11px] uppercase tracking-wider py-3 rounded transition-colors"
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </div>
  )
}
