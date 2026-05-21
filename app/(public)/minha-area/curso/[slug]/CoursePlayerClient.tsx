'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle2, Circle, PlayCircle, FileText, BookOpen,
  ChevronDown, ChevronRight, Menu, X, Award, ArrowLeft,
  Clock, Loader2
} from 'lucide-react'

interface Aula {
  id: string
  titulo: string
  tipo: string
  videoUrl: string | null
  videoProvider: string | null
  videoDuracao: number | null
  gratuita: boolean
  concluida: boolean
  ultimoSegundo: number
}

interface Modulo {
  id: string
  titulo: string
  aulas: Aula[]
}

interface Props {
  aluno: { id: string; nome: string }
  curso: { id: string; nome: string; slug: string; certificado: boolean; cargaHoraria: string | null }
  matricula: { id: string; progressoPercent: number; certificadoUrl: string | null; certificadoAt: string | null }
  modulos: Modulo[]
}

type VideoInfo =
  | { kind: 'blob'; url: string; ultimoSegundo: number }
  | { kind: 'iframe'; url: string }
  | null

function getVideoInfo(aula: Aula): VideoInfo {
  if (!aula.videoUrl) return null
  if (aula.videoProvider === 'blob') {
    return { kind: 'blob', url: aula.videoUrl, ultimoSegundo: aula.ultimoSegundo }
  }
  if (aula.videoProvider === 'youtube') {
    const match = aula.videoUrl.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    const id = match?.[1] ?? aula.videoUrl
    return { kind: 'iframe', url: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&start=${aula.ultimoSegundo}` }
  }
  if (aula.videoProvider === 'vimeo') {
    const id = aula.videoUrl.replace(/\D/g, '')
    return { kind: 'iframe', url: `https://player.vimeo.com/video/${id}` }
  }
  if (aula.videoProvider === 'bunny') {
    return { kind: 'iframe', url: aula.videoUrl }
  }
  // Fallback: tenta como blob direto
  return { kind: 'blob', url: aula.videoUrl, ultimoSegundo: aula.ultimoSegundo }
}

function VideoPlayer({ info, onProgress }: { info: VideoInfo; onProgress?: (segundos: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (info?.kind === 'blob' && videoRef.current && info.ultimoSegundo > 0) {
      videoRef.current.currentTime = info.ultimoSegundo
    }
  }, [info])

  if (!info) return null

  if (info.kind === 'blob') {
    return (
      <video
        ref={videoRef}
        src={info.url}
        controls
        className="w-full h-full object-contain"
        onTimeUpdate={(e) => {
          const v = e.currentTarget
          // Salva posição a cada 10 segundos
          if (Math.round(v.currentTime) % 10 === 0 && v.currentTime > 0) {
            onProgress?.(Math.round(v.currentTime))
          }
        }}
        onPause={(e) => onProgress?.(Math.round(e.currentTarget.currentTime))}
        controlsList="nodownload"
      />
    )
  }

  return (
    <iframe
      src={info.url}
      className="w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  )
}

function formatDuracao(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function CoursePlayerClient({ aluno, curso, matricula, modulos }: Props) {
  const todasAulas = modulos.flatMap(m => m.aulas)
  const [aulaAtual, setAulaAtual] = useState<Aula>(todasAulas[0] ?? null)
  const [concluidas, setConcluidas] = useState<Set<string>>(
    new Set(todasAulas.filter(a => a.concluida).map(a => a.id))
  )
  const [modulosAbertos, setModulosAbertos] = useState<Set<string>>(new Set([modulos[0]?.id]))
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const progressoPercent = Math.round((concluidas.size / todasAulas.length) * 100) || 0

  async function marcarConcluida(aulaId: string) {
    if (concluidas.has(aulaId)) return
    setSalvando(true)
    try {
      await fetch('/api/aluno/progresso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aulaId, cursoId: curso.id, concluida: true, percentualAssistido: 100 }),
      })
      setConcluidas(prev => new Set([...prev, aulaId]))

      // Avança para próxima aula
      const idx = todasAulas.findIndex(a => a.id === aulaId)
      if (idx < todasAulas.length - 1) {
        setAulaAtual(todasAulas[idx + 1])
      }
    } finally {
      setSalvando(false)
    }
  }

  function toggleModulo(id: string) {
    setModulosAbertos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const videoInfo = aulaAtual ? getVideoInfo(aulaAtual) : null

  async function salvarProgresso(segundos: number) {
    if (!aulaAtual) return
    await fetch('/api/aluno/progresso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aulaId: aulaAtual.id,
        cursoId: curso.id,
        concluida: false,
        percentualAssistido: 0,
        ultimoSegundo: segundos,
      }),
    }).catch(() => { /* silently fail */ })
  }

  return (
    <div className="min-h-screen bg-[#0f0e17] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1928] border-b border-white/10 py-3 px-4 flex items-center justify-between z-50 sticky top-0">
        <Link href="/minha-area" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:block">Minha Área</span>
        </Link>
        <h1 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-lg">{curso.nome}</h1>
        <button onClick={() => setSidebarAberta(!sidebarAberta)} className="lg:hidden text-gray-400 hover:text-white">
          {sidebarAberta ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Barra de progresso geral */}
      <div className="h-1 bg-white/10">
        <div className="h-full bg-gradient-to-r from-[#6a5a98] to-[#9b7fc7] transition-all duration-500"
          style={{ width: `${progressoPercent}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Player */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {/* Vídeo */}
          <div className="bg-black aspect-video w-full">
            {videoInfo ? (
              <VideoPlayer info={videoInfo} onProgress={salvarProgresso} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                {aulaAtual?.tipo === 'texto' ? (
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm">Conteúdo em texto — role para baixo</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-sm">Nenhum vídeo disponível</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info e controles da aula */}
          <div className="p-6 max-w-4xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-gray-400 text-xs mb-1">
                  {modulos.find(m => m.aulas.some(a => a.id === aulaAtual?.id))?.titulo}
                </p>
                <h2 className="text-xl font-bold">{aulaAtual?.titulo}</h2>
              </div>
              <button
                onClick={() => aulaAtual && marcarConcluida(aulaAtual.id)}
                disabled={salvando || (aulaAtual ? concluidas.has(aulaAtual.id) : true)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  aulaAtual && concluidas.has(aulaAtual.id)
                    ? 'bg-green-500/20 text-green-400 cursor-default'
                    : 'bg-[#6a5a98] hover:bg-[#7a6aa8] text-white'
                }`}>
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> :
                  aulaAtual && concluidas.has(aulaAtual.id) ?
                    <><CheckCircle2 className="w-4 h-4" /> Concluída</> :
                    <><CheckCircle2 className="w-4 h-4" /> Marcar como concluída</>
                }
              </button>
            </div>

            {/* Conteúdo texto */}
            {aulaAtual?.tipo === 'texto' && aulaAtual && (
              <div className="prose prose-invert max-w-none mt-6 text-gray-300 leading-relaxed">
                <p>{aulaAtual.titulo}</p>
              </div>
            )}

            {/* Certificado */}
            {progressoPercent === 100 && curso.certificado && (
              <div className="mt-8 bg-gradient-to-r from-[#6a5a98]/30 to-[#4a3a78]/30 border border-[#6a5a98]/50 rounded-2xl p-6 flex items-center gap-4">
                <Award className="w-10 h-10 text-[#9b7fc7] flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white">🎉 Parabéns! Você concluiu o curso!</h3>
                  <p className="text-gray-400 text-sm mt-0.5">Seu certificado NBP Psicanálise está disponível.</p>
                </div>
                {matricula.certificadoAt && (
                  <span className="ml-auto bg-[#6a5a98] text-white px-4 py-2 rounded-xl text-sm font-semibold">
                    Ver Certificado
                  </span>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Sidebar — lista de aulas */}
        <aside className={`
          fixed inset-y-0 right-0 z-40 w-80 bg-[#1a1928] border-l border-white/10 overflow-y-auto transition-transform duration-300
          lg:relative lg:translate-x-0 lg:z-auto lg:inset-y-auto lg:right-auto
          ${sidebarAberta ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Conteúdo do Curso</h3>
              <span className="text-xs text-gray-400">{progressoPercent}% concluído</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#6a5a98] rounded-full transition-all"
                style={{ width: `${progressoPercent}%` }} />
            </div>
          </div>

          <div className="py-2">
            {modulos.map((modulo, mi) => (
              <div key={modulo.id}>
                {/* Header do módulo */}
                <button
                  onClick={() => toggleModulo(modulo.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Módulo {mi + 1}</p>
                    <p className="text-sm font-medium text-gray-200">{modulo.titulo}</p>
                  </div>
                  {modulosAbertos.has(modulo.id) ?
                    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" /> :
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  }
                </button>

                {/* Aulas do módulo */}
                {modulosAbertos.has(modulo.id) && (
                  <div className="pb-2">
                    {modulo.aulas.map((aula, ai) => {
                      const isConcluida = concluidas.has(aula.id)
                      const isAtiva = aulaAtual?.id === aula.id
                      return (
                        <button key={aula.id}
                          onClick={() => { setAulaAtual(aula); setSidebarAberta(false) }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            isAtiva ? 'bg-[#6a5a98]/30 border-r-2 border-[#6a5a98]' : 'hover:bg-white/5'
                          }`}>
                          {isConcluida ?
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                            <Circle className={`w-4 h-4 flex-shrink-0 ${isAtiva ? 'text-[#9b7fc7]' : 'text-gray-600'}`} />
                          }
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs truncate ${isAtiva ? 'text-white font-medium' : 'text-gray-400'}`}>
                              {ai + 1}. {aula.titulo}
                            </p>
                            {aula.videoDuracao && (
                              <p className="text-xs text-gray-600 mt-0.5">{formatDuracao(aula.videoDuracao)}</p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
