'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2,
  GripVertical, Video, FileText, BookOpen, Lock, Unlock,
  Loader2, FolderOpen
} from 'lucide-react'
import { AulaModal } from './AulaModal'
import { Button } from '@/components/ui/button'

interface Aula {
  id: string
  moduloId: string
  cursoId: string
  titulo: string
  descricao?: string | null
  ordem: number
  tipo: string
  videoUrl?: string | null
  videoProvider?: string | null | undefined
  videoDuracao?: number | null
  gratuita: boolean
  ativo: boolean
}

interface Modulo {
  id: string
  cursoId: string
  titulo: string
  descricao?: string | null
  ordem: number
  ativo: boolean
  aulas: Aula[]
}

interface AulasEditorProps {
  cursoId: string
  cursoNome: string
  modulosIniciais: Modulo[]
}

// ── Ícone por tipo de aula ──────────────────────────────
function TipoIcon({ tipo }: { tipo: string }) {
  if (tipo === 'pdf') return <FileText className="w-3.5 h-3.5 text-blue-400" />
  if (tipo === 'texto') return <BookOpen className="w-3.5 h-3.5 text-purple-400" />
  return <Video className="w-3.5 h-3.5 text-orange-400" />
}

// ── Item de Aula ─────────────────────────────────────────
function AulaItem({
  aula,
  onEdit,
  onDelete,
}: {
  aula: Aula
  onEdit: (aula: Aula) => void
  onDelete: (aulaId: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Remover a aula "${aula.titulo}"? O vídeo também será apagado do servidor.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/aulas/${aula.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao remover')
      toast.success('Aula removida')
      onDelete(aula.id)
    } catch {
      toast.error('Falha ao remover aula')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-zinc-700/50">
      {/* Grip (drag — visual only por ora) */}
      <GripVertical className="w-4 h-4 text-zinc-700 cursor-grab shrink-0" />

      {/* Tipo */}
      <TipoIcon tipo={aula.tipo} />

      {/* Título */}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-zinc-200 truncate block">{aula.titulo}</span>
        {aula.descricao && (
          <span className="text-xs text-zinc-500 truncate block">{aula.descricao}</span>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {aula.gratuita && (
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Unlock className="w-2.5 h-2.5" /> Preview
          </span>
        )}
        {aula.videoUrl && aula.videoProvider === 'blob' && (
          <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Blob
          </span>
        )}
        {aula.videoProvider === 'youtube' && (
          <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            YouTube
          </span>
        )}
      </div>

      {/* Ações — visíveis no hover */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(aula)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Editar aula"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
          title="Remover aula"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

// ── Card de Módulo ───────────────────────────────────────
function ModuloCard({
  modulo,
  onAddAula,
  onEditAula,
  onDeleteAula,
  onDeleteModulo,
  onEditModulo,
}: {
  modulo: Modulo
  onAddAula: (moduloId: string) => void
  onEditAula: (aula: Aula) => void
  onDeleteAula: (aulaId: string, moduloId: string) => void
  onDeleteModulo: (moduloId: string) => void
  onEditModulo: (modulo: Modulo) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteModulo = async () => {
    if (!confirm(`Remover o módulo "${modulo.titulo}" e TODAS as suas aulas?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/modulos/${modulo.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Módulo removido')
      onDeleteModulo(modulo.id)
    } catch {
      toast.error('Falha ao remover módulo')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Header do módulo */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800/40 border-b border-zinc-800">
        <GripVertical className="w-4 h-4 text-zinc-600 cursor-grab shrink-0" />

        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {expanded
            ? <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            : <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          }
          <FolderOpen className="w-4 h-4 text-orange-400 shrink-0" />
          <span className="text-sm font-semibold text-zinc-100 truncate">{modulo.titulo}</span>
          <span className="text-xs text-zinc-500 shrink-0">
            {modulo.aulas.length} {modulo.aulas.length === 1 ? 'aula' : 'aulas'}
          </span>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAddAula(modulo.id)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" /> Aula
          </button>
          <button
            onClick={() => onEditModulo(modulo)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteModulo}
            disabled={deleting}
            className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Aulas */}
      {expanded && (
        <div className="p-2">
          {modulo.aulas.length === 0 ? (
            <div
              onClick={() => onAddAula(modulo.id)}
              className="flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-zinc-800 text-zinc-600 cursor-pointer hover:text-zinc-400 hover:border-zinc-700 transition-colors"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-sm">Adicionar primeira aula</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {modulo.aulas.map(aula => (
                <AulaItem
                  key={aula.id}
                  aula={aula}
                  onEdit={onEditAula}
                  onDelete={(id) => onDeleteAula(id, modulo.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Editor Principal ─────────────────────────────────────
export function AulasEditor({ cursoId, cursoNome, modulosIniciais }: AulasEditorProps) {
  const [modulos, setModulos] = useState<Modulo[]>(modulosIniciais)

  // Modal de aula
  const [aulaModal, setAulaModal] = useState<{
    open: boolean
    moduloId: string
    aulaParaEditar?: Aula | null
  }>({ open: false, moduloId: '' })

  // Modal de módulo (apenas título/edição rápida)
  const [moduloModal, setModuloModal] = useState<{
    open: boolean
    moduloParaEditar?: Modulo | null
  }>({ open: false })
  const [novoModuloTitulo, setNovoModuloTitulo] = useState('')
  const [savingModulo, setSavingModulo] = useState(false)

  // ── Helpers de state ────────────────────────────────────

  const addOrUpdateAula = useCallback((aula: Aula) => {
    setModulos(prev => prev.map(m => {
      if (m.id !== aula.moduloId) return m
      const existe = m.aulas.find(a => a.id === aula.id)
      return {
        ...m,
        aulas: existe
          ? m.aulas.map(a => a.id === aula.id ? aula : a)
          : [...m.aulas, aula],
      }
    }))
  }, [])

  const removeAula = useCallback((aulaId: string, moduloId: string) => {
    setModulos(prev => prev.map(m =>
      m.id !== moduloId ? m : { ...m, aulas: m.aulas.filter(a => a.id !== aulaId) }
    ))
  }, [])

  const removeModulo = useCallback((moduloId: string) => {
    setModulos(prev => prev.filter(m => m.id !== moduloId))
  }, [])

  // ── Criar / editar módulo ───────────────────────────────

  const handleSaveModulo = async () => {
    const titulo = novoModuloTitulo.trim()
    if (!titulo) return

    setSavingModulo(true)
    try {
      if (moduloModal.moduloParaEditar) {
        // Edição
        const res = await fetch(`/api/admin/modulos/${moduloModal.moduloParaEditar.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo }),
        })
        if (!res.ok) throw new Error()
        const updated = await res.json()
        setModulos(prev => prev.map(m => m.id === updated.id ? { ...m, titulo: updated.titulo } : m))
        toast.success('Módulo atualizado!')
      } else {
        // Criação
        const res = await fetch('/api/admin/modulos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cursoId, titulo, ordem: modulos.length }),
        })
        if (!res.ok) throw new Error()
        const novoModulo = await res.json()
        setModulos(prev => [...prev, { ...novoModulo, aulas: [] }])
        toast.success('Módulo criado!')
      }
      setModuloModal({ open: false })
      setNovoModuloTitulo('')
    } catch {
      toast.error('Falha ao salvar módulo')
    } finally {
      setSavingModulo(false)
    }
  }

  // Reload aulas após salvar no modal
  const handleAulaSuccess = async () => {
    // Re-fetch apenas as aulas do módulo em questão
    try {
      const res = await fetch(`/api/admin/aulas?moduloId=${aulaModal.moduloId}`)
      if (!res.ok) return
      const aulas: Aula[] = await res.json()
      setModulos(prev => prev.map(m =>
        m.id === aulaModal.moduloId ? { ...m, aulas } : m
      ))
    } catch {
      // Silently fail — a próxima visita vai carregar correto
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Módulos & Aulas</h2>
          <p className="text-sm text-zinc-500">{cursoNome}</p>
        </div>
        <Button
          onClick={() => {
            setNovoModuloTitulo('')
            setModuloModal({ open: true, moduloParaEditar: null })
          }}
          className="flex items-center gap-2 text-white font-medium"
          style={{ backgroundColor: '#F97316' }}
        >
          <Plus className="w-4 h-4" />
          Novo Módulo
        </Button>
      </div>

      {/* Lista de módulos */}
      {modulos.length === 0 ? (
        <div
          onClick={() => {
            setNovoModuloTitulo('')
            setModuloModal({ open: true, moduloParaEditar: null })
          }}
          className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-zinc-800 text-zinc-600 cursor-pointer hover:text-zinc-400 hover:border-zinc-700 transition-colors"
        >
          <FolderOpen className="w-10 h-10 mb-3" />
          <p className="text-base font-medium">Nenhum módulo ainda</p>
          <p className="text-sm mt-1">Clique para criar o primeiro módulo</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modulos.map(modulo => (
            <ModuloCard
              key={modulo.id}
              modulo={modulo}
              onAddAula={(moduloId) => setAulaModal({ open: true, moduloId, aulaParaEditar: null })}
              onEditAula={(aula) => setAulaModal({ open: true, moduloId: aula.moduloId, aulaParaEditar: aula })}
              onDeleteAula={removeAula}
              onDeleteModulo={removeModulo}
              onEditModulo={(m) => {
                setNovoModuloTitulo(m.titulo)
                setModuloModal({ open: true, moduloParaEditar: m })
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de Aula */}
      <AulaModal
        open={aulaModal.open}
        onClose={() => setAulaModal({ open: false, moduloId: '' })}
        onSuccess={handleAulaSuccess}
        moduloId={aulaModal.moduloId}
        cursoId={cursoId}
        aula={aulaModal.aulaParaEditar}
        proximaOrdem={
          modulos.find(m => m.id === aulaModal.moduloId)?.aulas.length ?? 0
        }
      />

      {/* Modal de Módulo (mini) */}
      {moduloModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModuloModal({ open: false })} />
          <div className="relative w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">
              {moduloModal.moduloParaEditar ? 'Editar Módulo' : 'Novo Módulo'}
            </h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Título do módulo *</label>
              <input
                autoFocus
                value={novoModuloTitulo}
                onChange={e => setNovoModuloTitulo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveModulo()}
                placeholder="Ex: Módulo 1 — Introdução"
                className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-white bg-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setModuloModal({ open: false })} className="flex-1 border-zinc-700 text-zinc-300">
                Cancelar
              </Button>
              <Button
                onClick={handleSaveModulo}
                disabled={savingModulo || !novoModuloTitulo.trim()}
                className="flex-1 text-white font-semibold"
                style={{ backgroundColor: '#F97316' }}
              >
                {savingModulo ? 'Salvando…' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
