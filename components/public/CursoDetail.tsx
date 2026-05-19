'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, BookOpen, User, Clock, Award, CheckCircle, Share2, MessageCircle, FileText } from 'lucide-react'
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
  precoReferencia?: string | null
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

  const shareText = `Confira o curso ${curso.nome} no NBP Psicanálise!`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header Banner */}
      <div className="bg-[#5B1A82]/5 border border-[#5B1A82]/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#5B1A82] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cursos" className="hover:text-[#5B1A82] transition-colors">Cursos</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium capitalize">{curso.categoria}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-[#5B1A82] text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
            {curso.categoria}
          </span>
          {curso.destaque && (
            <span className="bg-amber-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ⭐ Destaque
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          {curso.nome}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sub-navigation Menu */}
          <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 flex gap-6 text-sm font-medium text-gray-500">
            <a href="#sobre" className="text-[#5B1A82] border-b-2 border-[#5B1A82] pb-3 -mb-[14px]">Mais Informações</a>
            <a href="#para-quem" className="hover:text-gray-900 transition-colors pb-3">Para Quem</a>
            <a href="#docente" className="hover:text-gray-900 transition-colors pb-3">Docente</a>
          </div>

          {/* Section: Sobre */}
          <section id="sobre" className="scroll-mt-32 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="size-5 text-[#5B1A82]" />
              Mais Informações
            </h3>
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm leading-relaxed text-gray-700 text-sm whitespace-pre-line">
              {curso.descricao || "Nenhuma descrição detalhada disponível para este curso no momento."}
            </div>
          </section>

          {/* Section: Para Quem */}
          <section id="para-quem" className="scroll-mt-32 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="size-5 text-[#5B1A82]" />
              Para Quem é Este Curso
            </h3>
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm leading-relaxed text-gray-700 text-sm">
              <p>
                Este curso é aberto a todos os adultos interessados em explorar as complexidades da psique humana através da lente da psicanálise. 
                Ideal para psicólogos, terapeutas, estudantes, profissionais de saúde e qualquer pessoa interessada em iniciar ou aprofundar sua jornada de autoconhecimento e formação clínica.
              </p>
            </div>
          </section>

          {/* Section: Docente */}
          <section id="docente" className="scroll-mt-32 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="size-5 text-[#5B1A82]" />
              Docente Responsável
            </h3>
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative size-24 md:size-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-200">
                  <img 
                    src="https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/47/47_ORG.jpg" 
                    alt="Aurélio Gonzales"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Aurélio Gonzales</h4>
                    <p className="text-xs font-semibold text-[#5B1A82] uppercase tracking-wider">
                      Psicanalista, Professor, Supervisor Clínico e Diretor do NBP
                    </p>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Aurélio Gonzales, psicanalista com mais de 12 anos de experiência clínica e didática na psicanálise, 
                    traz seu conhecimento profundo e atualizado para guiar os alunos nas vivências práticas e estudos teóricos do Núcleo Brasileiro de Psicanálise.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Floating Sticky Card) */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white border border-gray-150 rounded-2xl shadow-md overflow-hidden">
            {/* Imagem Principal */}
            <div 
              className="relative aspect-video bg-gray-100 cursor-zoom-in"
              onClick={() => fotos.length > 0 && setLightbox(true)}
            >
              {fotos[activePhoto] ? (
                <img 
                  src={fotos[activePhoto]} 
                  alt={curso.nome} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem imagem disponível
                </div>
              )}
            </div>

            {/* Preço e Botão */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                {curso.precoReferencia ? (
                  <div>
                    <span className="text-xs text-gray-500 block">Preço do Curso</span>
                    <span className="text-3xl font-black text-gray-900">
                      R$ {parseFloat(curso.precoReferencia).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">à vista</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-gray-500 block">Investimento</span>
                    <span className="text-2xl font-extrabold text-[#5B1A82]">Sob Consulta</span>
                  </div>
                )}
              </div>

              {/* Botão de Matrícula */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#5B1A82] hover:bg-[#481469] text-white font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#5B1A82]/20"
              >
                <MessageCircle className="size-5 fill-current" />
                Matricule-se no Curso
              </a>

              {/* Atributos */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <Clock className="size-4 text-[#5B1A82]" />
                  <span>Acesso imediato de 365 dias após inscrição</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <Award className="size-4 text-[#5B1A82]" />
                  <span>Certificado oficial inclusivo emitido pelo NBP</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <FileText className="size-4 text-[#5B1A82]" />
                  <span>Aulas gravadas com material de leitura complementar</span>
                </div>
              </div>

              {/* Compartilhar */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Compartilhar:</span>
                <div className="flex gap-2">
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="size-4" />
                  </a>
                </div>
              </div>
            </div>
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
    </div>
  )
}
