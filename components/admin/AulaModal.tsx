'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { X, Video, FileText, BookOpen } from 'lucide-react'
import { VideoUpload } from './VideoUpload'
import { Button } from '@/components/ui/button'

interface Aula {
  id?: string
  moduloId: string
  cursoId: string
  titulo: string
  descricao?: string | null
  ordem: number
  tipo: string
  videoUrl?: string | null
  videoProvider?: string | null | undefined
  videoDuracao?: number | null
  materialUrl?: string | null
  conteudoTexto?: string | null
  gratuita: boolean
  ativo: boolean
}

interface AulaModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  moduloId: string
  cursoId: string
  aula?: Aula | null
  proximaOrdem?: number
}

type FormData = {
  titulo: string
  descricao: string
  tipo: string
  videoUrl: string
  videoProvider: string
  materialUrl: string
  conteudoTexto: string
  gratuita: boolean
}

const TIPOS = [
  { value: 'video', label: 'Vídeo', icon: Video },
  { value: 'texto', label: 'Texto', icon: BookOpen },
  { value: 'pdf', label: 'PDF / Material', icon: FileText },
]

export function AulaModal({
  open, onClose, onSuccess, moduloId, cursoId, aula, proximaOrdem = 0
}: AulaModalProps) {
  const isEditing = !!aula?.id
  const [videoUrl, setVideoUrl] = useState(aula?.videoUrl ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      titulo: aula?.titulo ?? '',
      descricao: aula?.descricao ?? '',
      tipo: aula?.tipo ?? 'video',
      videoUrl: aula?.videoUrl ?? '',
      videoProvider: aula?.videoProvider ?? 'blob',
      materialUrl: aula?.materialUrl ?? '',
      conteudoTexto: aula?.conteudoTexto ?? '',
      gratuita: aula?.gratuita ?? false,
    },
  })

  const tipoAtual = watch('tipo')
  const videoProviderAtual = watch('videoProvider')

  // Reset form when modal opens/closes or aula changes
  useEffect(() => {
    if (open) {
      reset({
        titulo: aula?.titulo ?? '',
        descricao: aula?.descricao ?? '',
        tipo: aula?.tipo ?? 'video',
        videoUrl: aula?.videoUrl ?? '',
        videoProvider: aula?.videoProvider ?? 'blob',
        materialUrl: aula?.materialUrl ?? '',
        conteudoTexto: aula?.conteudoTexto ?? '',
        gratuita: aula?.gratuita ?? false,
      })
      setVideoUrl(aula?.videoUrl ?? '')
    }
  }, [open, aula, reset])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const payload: Partial<Aula> & { moduloId: string; cursoId: string } = {
        moduloId,
        cursoId,
        titulo: data.titulo,
        descricao: data.descricao || null,
        tipo: data.tipo,
        videoUrl: data.tipo === 'video' ? (videoUrl || null) : null,
        videoProvider: data.tipo === 'video' ? (data.videoProvider || 'blob') : undefined,
        materialUrl: data.materialUrl || null,
        conteudoTexto: data.conteudoTexto || null,
        gratuita: data.gratuita,
        ativo: true,
        ordem: aula?.ordem ?? proximaOrdem,
      }

      const url = isEditing ? `/api/admin/aulas/${aula!.id}` : '/api/admin/aulas'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Erro ao salvar')
      }

      toast.success(isEditing ? 'Aula atualizada!' : 'Aula criada!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar aula')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-brand-surface dark:bg-zinc-950 border border-brand-border/60 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-brand-border/60 dark:border-zinc-800 bg-brand-surface/90 dark:bg-zinc-950/90 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-semibold text-brand-text dark:text-white">
              {isEditing ? 'Editar Aula' : 'Nova Aula'}
            </h2>
            <p className="text-xs text-brand-muted dark:text-zinc-500 mt-0.5">
              {isEditing ? 'Edite os dados da aula' : 'Preencha os dados para criar uma nova aula'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-brand-muted dark:text-zinc-400 hover:text-brand-text dark:hover:text-white hover:bg-brand-surface-2 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">Título *</label>
            <input
              {...register('titulo', { required: 'Título obrigatório' })}
              placeholder="Ex: Introdução à Psicanálise"
              className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all placeholder:text-brand-muted/70"
            />
            {errors.titulo && <p className="text-xs text-red-400">{errors.titulo.message}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">Descrição</label>
            <textarea
              {...register('descricao')}
              rows={2}
              placeholder="Breve descrição do conteúdo desta aula…"
              className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all placeholder:text-brand-muted/70 resize-none"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">Tipo de Aula</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('tipo', value)}
                  className={`
                    flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${tipoAtual === value
                      ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                      : 'border-brand-border/60 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md text-brand-text dark:text-zinc-400 hover:text-brand-text dark:hover:text-zinc-200'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo baseado no tipo */}
          {tipoAtual === 'video' && (
            <div className="space-y-3">
              {/* Seletor de origem do vídeo */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">Origem do Vídeo</label>
                <div className="flex gap-2">
                  {[
                    { value: 'blob', label: '📁 Upload (nosso servidor)' },
                    { value: 'youtube', label: '▶️ YouTube' },
                    { value: 'vimeo', label: '🎬 Vimeo' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue('videoProvider', opt.value)}
                      className={`
                        flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all
                        ${videoProviderAtual === opt.value
                          ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
                          : 'border-brand-border/60 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md text-brand-text dark:text-zinc-400 hover:text-brand-text dark:hover:text-zinc-200'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload ou URL */}
              {videoProviderAtual === 'blob' ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">Arquivo de Vídeo</label>
                  <VideoUpload
                    value={videoUrl}
                    onChange={(url) => { setVideoUrl(url); setValue('videoUrl', url) }}
                    onClear={() => { setVideoUrl(''); setValue('videoUrl', '') }}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">
                    {videoProviderAtual === 'youtube' ? 'ID ou URL do YouTube' : 'ID ou URL do Vimeo'}
                  </label>
                  <input
                    {...register('videoUrl')}
                    placeholder={
                      videoProviderAtual === 'youtube'
                        ? 'Ex: dQw4w9WgXcQ ou https://youtu.be/...'
                        : 'Ex: 123456789 ou https://vimeo.com/...'
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all placeholder:text-brand-muted/70"
                  />
                  <p className="text-xs text-brand-muted dark:text-zinc-500">
                    {videoProviderAtual === 'youtube'
                      ? 'Cole o ID do vídeo (parte após ?v=) ou a URL completa'
                      : 'Cole o ID numérico ou a URL completa do Vimeo'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {tipoAtual === 'pdf' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">URL do Material (PDF)</label>
              <input
                {...register('materialUrl')}
                placeholder="https://..."
                className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all placeholder:text-brand-muted/70"
              />
            </div>
          )}

          {tipoAtual === 'texto' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text/90 dark:text-zinc-300">Conteúdo (Markdown)</label>
              <textarea
                {...register('conteudoTexto')}
                rows={8}
                placeholder="# Título&#10;&#10;Conteúdo da aula em markdown..."
                className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all placeholder:text-brand-muted/70 resize-none font-mono"
              />
            </div>
          )}

          {/* Gratuita (preview) */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              {...register('gratuita')}
              type="checkbox"
              className="w-4 h-4 rounded accent-brand-accent"
            />
            <div>
              <span className="text-sm text-brand-text/90 dark:text-zinc-300 group-hover:text-brand-text dark:group-hover:text-white transition-colors font-medium">
                Aula gratuita (preview público)
              </span>
              <p className="text-xs text-brand-muted dark:text-zinc-500">Não-alunos poderão assistir esta aula como demonstração</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-brand-border/60 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-brand-border/60 dark:border-zinc-700 text-brand-text dark:text-zinc-300 hover:bg-brand-surface-2 dark:hover:bg-zinc-800 hover:text-brand-text dark:hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 text-white font-semibold bg-brand-accent hover:bg-brand-accent/90 transition-colors"
            >
              {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Criar aula'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
