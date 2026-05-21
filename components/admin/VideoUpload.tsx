'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, Video, X, CheckCircle, AlertCircle, FileVideo, Server } from 'lucide-react'

interface VideoUploadProps {
  value?: string | null        // URL atual do vídeo
  onChange: (url: string) => void
  onClear?: () => void
}

type UploadState = 'idle' | 'authorizing' | 'uploading' | 'success' | 'error'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function VideoUpload({ value, onChange, onClear }: VideoUploadProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const handleFile = useCallback(async (file: File) => {
    // ── Validação do arquivo ────────────────────────────
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg']
    if (!validTypes.includes(file.type)) {
      setErrorMsg(`Formato não suportado. Use: MP4, WebM, MOV, AVI ou MKV`)
      setState('error')
      return
    }

    const maxSize = 500 * 1024 * 1024 // 500 MB
    if (file.size > maxSize) {
      setErrorMsg(`Arquivo muito grande. Máximo: 500 MB`)
      setState('error')
      return
    }

    setFileInfo({ name: file.name, size: file.size })
    setState('authorizing')
    setProgress(0)
    setErrorMsg('')

    try {
      // ── Passo 1: pega token temporário do Next.js ───
      // O Next.js valida que o usuário é admin e retorna
      // { uploadUrl, token } sem expor o secret no frontend
      const tokenRes = await fetch('/api/admin/upload-video', { method: 'POST' })

      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}))
        const hint = (err as { hint?: string }).hint
        throw new Error(
          hint
            ? `Servidor de vídeo não configurado.\n${hint}`
            : ((err as { error?: string }).error ?? 'Erro ao autorizar upload')
        )
      }

      const { uploadUrl, token } = await tokenRes.json() as {
        uploadUrl: string
        token: string
        expiresAt: number
      }

      // ── Passo 2: upload direto para o HostGator ─────
      // XHR em vez de fetch para ter progresso real
      setState('uploading')

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr

        const formData = new FormData()
        formData.append('file', file)

        xhr.open('POST', uploadUrl)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)

        // Progresso do upload
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText) as { url?: string; error?: string }
              if (data.url) {
                setState('success')
                setProgress(100)
                onChange(data.url)
                resolve()
              } else {
                reject(new Error(data.error ?? 'Resposta inválida do servidor'))
              }
            } catch {
              reject(new Error('Resposta inválida do servidor de vídeo'))
            }
          } else {
            let errorText = `Erro ${xhr.status}`
            try {
              const data = JSON.parse(xhr.responseText) as { error?: string }
              errorText = data.error ?? errorText
            } catch { /* ignora */ }
            reject(new Error(errorText))
          }
        }

        xhr.onerror = () => reject(new Error('Falha de conexão com o servidor de vídeo'))
        xhr.onabort = () => reject(new Error('Upload cancelado'))

        xhr.send(formData)
      })

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha no upload'
      setErrorMsg(msg)
      setState('error')
    } finally {
      xhrRef.current = null
    }
  }, [onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleCancel = () => {
    xhrRef.current?.abort()
    handleClear()
  }

  const handleClear = () => {
    setState('idle')
    setProgress(0)
    setFileInfo(null)
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
    onClear?.()
  }

  // ── Vídeo já hospedado (tem URL) ──────────────────────────
  if (value && state !== 'uploading' && state !== 'authorizing') {
    return (
      <div className="rounded-xl border border-brand-border/60 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md overflow-hidden">
        {/* Preview do vídeo */}
        <div className="relative bg-black aspect-video">
          <video
            src={value}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          />
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/20 dark:bg-black/40 backdrop-blur-md border-t border-brand-border/40 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Vídeo no servidor</span>
            <div className="flex items-center gap-1 text-xs text-brand-muted">
              <Server className="w-3 h-3" />
              <span>HostGator</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-brand-border/60 dark:border-zinc-700 text-brand-text dark:text-zinc-300 hover:text-brand-text dark:hover:text-white hover:bg-brand-surface-2 dark:hover:bg-zinc-800 transition-colors"
            >
              Substituir
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-800/60 text-red-500 hover:bg-red-950/25 dark:hover:bg-red-950/40 transition-colors"
            >
              Remover
            </button>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    )
  }

  // ── Autorizando (aguarda token do Next.js) ────────────────
  if (state === 'authorizing') {
    return (
      <div className="rounded-xl border border-brand-border/60 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border-2 border-brand-accent/30 border-t-brand-accent animate-spin" />
          <div>
            <p className="text-sm font-medium text-brand-text dark:text-white">Autorizando upload…</p>
            <p className="text-xs text-brand-muted dark:text-zinc-500 mt-0.5">Verificando permissões de admin</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Uploading ─────────────────────────────────────────────
  if (state === 'uploading') {
    return (
      <div className="rounded-xl border border-brand-border/60 dark:border-zinc-800 bg-white/40 dark:bg-black/20 backdrop-blur-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center shrink-0">
            <FileVideo className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-text dark:text-white truncate">{fileInfo?.name}</p>
            <p className="text-xs text-brand-muted dark:text-zinc-500">{fileInfo ? formatBytes(fileInfo.size) : ''}</p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-brand-muted hover:text-brand-text dark:hover:text-zinc-300 transition-colors p-1"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-brand-border/40 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-accent to-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-brand-muted">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3" />
              Enviando para o HostGator…
            </span>
            <span className="font-semibold">{progress}%</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Falha no upload</p>
            <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5 whitespace-pre-line">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-brand-muted hover:text-brand-text dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setState('idle'); setErrorMsg(''); inputRef.current?.click() }}
          className="mt-4 w-full py-2 rounded-lg border border-brand-border/60 dark:border-zinc-700 text-sm text-brand-text dark:text-zinc-300 hover:text-brand-text dark:hover:text-white hover:border-brand-border dark:hover:border-zinc-500 transition-colors"
        >
          Tentar novamente
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    )
  }

  // ── Idle — Dropzone ───────────────────────────────────────
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer
        transition-all duration-200 group
        ${isDragging
          ? 'border-brand-accent bg-brand-accent/5'
          : 'border-brand-border/60 dark:border-zinc-800 hover:border-brand-accent bg-white/20 dark:bg-black/10 backdrop-blur-md hover:bg-white/40 dark:hover:bg-black/20'
        }
      `}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
          ${isDragging ? 'bg-brand-accent/20' : 'bg-white/50 dark:bg-zinc-800 group-hover:bg-white/70 dark:group-hover:bg-zinc-700'}
        `}>
          {isDragging
            ? <Video className="w-7 h-7 text-brand-accent" />
            : <Upload className="w-7 h-7 text-brand-muted dark:text-zinc-400 group-hover:text-brand-text dark:group-hover:text-zinc-200" />
          }
        </div>

        <div>
          <p className="text-sm font-medium text-brand-text dark:text-zinc-200">
            {isDragging ? 'Solte o vídeo aqui' : 'Clique ou arraste um vídeo'}
          </p>
          <p className="text-xs text-brand-muted dark:text-zinc-500 mt-1">
            MP4, WebM, MOV, AVI ou MKV · Até 500 MB
          </p>
        </div>

        {/* Badge indicando onde será salvo */}
        <div className="flex items-center gap-1.5 text-[11px] text-brand-muted/80 bg-white/30 dark:bg-zinc-800/60 px-2.5 py-1 rounded-full border border-brand-border/40 dark:border-zinc-700/50">
          <Server className="w-3 h-3" />
          <span>Salvo no seu servidor HostGator</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
