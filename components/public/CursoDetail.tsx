'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { whatsappLink, WHATSAPP_NUMBER, cn } from '@/lib/utils'

interface Curso {
  id: string
  nome: string
  slug: string
  descricao: string | null
  categoria: string
  faixaEtaria: string
  capacidade: string
  dimensoes: string
  energia: string | null
  fotos: string[] | null
  fotoDestaque: string | null
  destaque: boolean
}

export function CursoDetail({ curso }: { curso: Curso }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const fotos = curso.fotos?.length
    ? curso.fotos
    : curso.fotoDestaque
    ? [curso.fotoDestaque]
    : []

  const waLink = whatsappLink(
    WHATSAPP_NUMBER,
    `Olá! Tenho interesse em me matricular no curso *${curso.nome}*. Como posso prosseguir com a inscrição?`
  )

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12 bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
        {/* Galeria */}
        <div className="space-y-3">
          {/* Foto principal */}
          <div
            className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 cursor-zoom-in"
            onClick={() => fotos.length > 0 && setLightbox(true)}
          >
            {fotos[activePhoto] ? (
              <img
                src={fotos[activePhoto]}
                alt={curso.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                Sem foto disponível
              </div>
            )}
            {fotos.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                {activePhoto + 1} / {fotos.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {fotos.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {fotos.map((foto, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={cn(
                    'relative aspect-square rounded overflow-hidden bg-gray-50 transition-all border',
                    i === activePhoto ? 'border-[#6a5a98] ring-1 ring-[#6a5a98]' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={foto} alt={`${curso.nome} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="bg-[#6a5a98] text-white text-[10px] px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
              {curso.categoria}
            </span>
            {curso.destaque && (
              <span className="bg-yellow-600/10 text-yellow-600 text-[10px] px-2.5 py-0.5 rounded border border-yellow-600/20 font-bold uppercase tracking-wider">
                ⭐ Destaque
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase mt-3 mb-4 font-[family-name:var(--font-heading)]">
            {curso.nome}
          </h1>

          {curso.descricao && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6 font-light whitespace-pre-line">{curso.descricao}</p>
          )}

          {/* CTAs */}
          <div className="mt-auto pt-6 border-t border-gray-150 space-y-3">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#6a5a98] hover:bg-[#584885] text-white font-bold py-4 rounded text-sm uppercase tracking-wider transition-colors"
            >
              Matricule-se no Curso
            </a>

            <Link
              href="/cursos"
              className="flex items-center justify-center w-full border border-gray-200 text-gray-700 hover:border-[#6a5a98] hover:text-[#6a5a98] font-semibold py-3 rounded text-xs uppercase tracking-wider transition-colors"
            >
              Ver mais cursos
            </Link>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && fotos.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightbox(false)}
          >
            <X className="size-8" />
          </button>
          <div className="relative max-w-4xl max-h-[90dvh] w-full h-full">
            <Image
              src={fotos[activePhoto]}
              alt={curso.nome}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {fotos.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActivePhoto(i) }}
                  className={cn('w-2 h-2 rounded-full transition-all', i === activePhoto ? 'bg-white scale-125' : 'bg-white/40')}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
