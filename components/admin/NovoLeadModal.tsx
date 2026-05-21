'use client'

import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Lead } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (lead: Lead) => void
  todosCursos?: string[]
}

const ORIGENS = [
  { value: 'manual', label: 'Manual (admin)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'site', label: 'Site' },
  { value: 'bio', label: 'Bio link' },
  { value: 'whatsapp', label: 'WhatsApp direto' },
  { value: 'outro', label: 'Outro' },
]

const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
]

export function NovoLeadModal({ open, onClose, onCreated, todosCursos = [] }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    cursosInteresse: [] as string[],
    mensagem: '',
    origem: 'manual',
    valorProposto: '',
    prioridade: 'normal',
    status: 'novo',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.telefone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          valorProposto: form.valorProposto ? form.valorProposto : null,
        }),
      })
      if (!res.ok) throw new Error()
      const lead = await res.json()
      toast.success('Lead criado com sucesso!')
      onCreated(lead)
      onClose()
      setForm({
        nome: '',
        telefone: '',
        email: '',
        cursosInteresse: [],
        mensagem: '',
        origem: 'manual',
        valorProposto: '',
        prioridade: 'normal',
        status: 'novo',
      })
    } catch {
      toast.error('Erro ao criar lead')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
              <Plus className="size-4 text-brand-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-brand-text text-base">Novo Lead</h2>
              <p className="text-brand-muted text-xs">Cadastro manual de lead</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-brand-surface-2 hover:bg-red-500/10 hover:text-red-400 text-brand-muted flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nome + Telefone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Nome *</label>
              <input
                value={form.nome} onChange={set('nome')} required
                placeholder="Nome do cliente"
                className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Telefone *</label>
              <input
                value={form.telefone} onChange={set('telefone')} required
                placeholder="(12) 99999-9999"
                className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1.5">E-mail</label>
            <input
              type="email" value={form.email} onChange={set('email')}
              placeholder="email@exemplo.com"
              className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
            />
          </div>

          {/* Cursos de Interesse */}
          {todosCursos.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Cursos de Interesse</label>
              <div className="flex flex-wrap gap-2">
                {todosCursos.map(curso => {
                  const selected = form.cursosInteresse.includes(curso)
                  return (
                    <button
                      key={curso}
                      type="button"
                      onClick={() => {
                        setForm(f => {
                          const current = f.cursosInteresse
                          const next = current.includes(curso)
                            ? current.filter(c => c !== curso)
                            : [...current, curso]
                          return { ...f, cursosInteresse: next }
                        })
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent'
                          : 'bg-white/40 dark:bg-black/20 border-brand-border/60 dark:border-zinc-800 text-brand-muted hover:border-brand-border/80'
                      }`}
                    >
                      {curso}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Origem + Prioridade + Valor */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Origem</label>
              <select value={form.origem} onChange={set('origem')} className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all">
                {ORIGENS.map(o => <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-950 text-brand-text">{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Prioridade</label>
              <select value={form.prioridade} onChange={set('prioridade')} className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all">
                {PRIORIDADES.map(p => <option key={p.value} value={p.value} className="bg-white dark:bg-zinc-950 text-brand-text">{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-muted mb-1.5">Valor (R$)</label>
              <input
                type="number" min="0" step="0.01"
                value={form.valorProposto} onChange={set('valorProposto')}
                placeholder="0,00"
                className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
              />
            </div>
          </div>

          {/* Status inicial */}
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Status inicial</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { v: 'novo', l: 'Novo' },
                { v: 'contato', l: 'Em contato' },
                { v: 'proposta', l: 'Proposta enviada' },
                { v: 'negociacao', l: 'Negociação' },
              ].map(s => (
                <button
                  key={s.v} type="button"
                  onClick={() => setForm(f => ({ ...f, status: s.v }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${form.status === s.v ? 'bg-brand-accent/20 border-brand-accent/40 text-brand-accent' : 'bg-white/40 dark:bg-black/20 border-brand-border/60 dark:border-zinc-800 text-brand-muted hover:border-brand-border/80'}`}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-xs font-medium text-brand-muted mb-1.5">Observações</label>
            <textarea
              value={form.mensagem} onChange={set('mensagem')} rows={3}
              placeholder="Detalhes do interesse, observações..."
              className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-brand-border/60 dark:border-zinc-800 text-brand-muted hover:bg-white/10 dark:hover:bg-white/5 text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Criar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
