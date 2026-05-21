'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  X,
  Phone,
  Mail,
  Tag,
  DollarSign,
  Package,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn, whatsappLink, STATUS_KANBAN, formatCurrency, formatPhone } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { InteractionTimeline } from './InteractionTimeline'
import type { LeadComInteracoes } from '@/types'

interface Props {
  lead: LeadComInteracoes | null
  onClose: () => void
  onUpdate: () => void
}

const TIPO_INTERACAO = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'ligacao', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'nota', label: 'Nota interna' },
]

export function LeadModal({ lead, onClose, onUpdate }: Props) {
  const [novoTipo, setNovoTipo] = useState('whatsapp')
  const [novoConteudo, setNovoConteudo] = useState('')
  const [sending, setSending] = useState(false)

  if (!lead) return null

  const statusConfig = STATUS_KANBAN.find((s) => s.id === lead.status)

  const waLink = whatsappLink(
    lead.telefone,
    `Olá ${lead.nome}, tudo bem? Aqui é do NBP Psicanálise! 🎓`,
  )

  const handleEnviarInteracao = async () => {
    if (!novoConteudo.trim()) {
      toast.error('Informe o conteúdo da interação')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/interacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, tipo: novoTipo, conteudo: novoConteudo }),
      })

      if (!res.ok) throw new Error()

      toast.success('Interação registrada com sucesso')
      setNovoConteudo('')
      onUpdate()
    } catch {
      toast.error('Erro ao registrar interação')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet panel */}
      <div
        className="w-full max-w-xl flex flex-col h-full overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'var(--brand-bg)', borderLeft: '1px solid var(--brand-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 border-b"
          style={{ borderColor: 'var(--brand-border)' }}
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-white">{lead.nome}</h2>
            {statusConfig && (
              <span
                className="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `${statusConfig.cor}20`,
                  color: statusConfig.cor,
                  border: `1px solid ${statusConfig.cor}40`,
                }}
              >
                {statusConfig.label}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Action buttons */}
          <div className="flex gap-2">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl">
                <MessageCircle size={16} />
                Enviar WhatsApp
              </Button>
            </a>
          </div>

          {/* Lead data */}
          <div
            className="rounded-xl border p-4 flex flex-col gap-3 bg-white/40 dark:bg-black/20 backdrop-blur-md"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Dados do Lead</h3>

            <InfoRow icon={<Phone size={14} />} label="Telefone">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                {formatPhone(lead.telefone)}
              </a>
            </InfoRow>

            {lead.email && (
              <InfoRow icon={<Mail size={14} />} label="E-mail">
                <a href={`mailto:${lead.email}`} className="text-brand-accent hover:underline font-medium">
                  {lead.email}
                </a>
              </InfoRow>
            )}

            <InfoRow icon={<Tag size={14} />} label="Origem">
              <span className="text-brand-text dark:text-zinc-200 capitalize">{lead.origem}</span>
            </InfoRow>

            {lead.valorProposto && (
              <InfoRow icon={<DollarSign size={14} />} label="Valor Proposto">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {formatCurrency(lead.valorProposto)}
                </span>
              </InfoRow>
            )}

            {lead.valorSinal && (
              <InfoRow icon={<DollarSign size={14} />} label="Sinal">
                <span className="text-brand-text dark:text-zinc-200">{formatCurrency(lead.valorSinal)}</span>
              </InfoRow>
            )}

            {lead.cursosInteresse && lead.cursosInteresse.length > 0 && (
              <div className="flex gap-2 items-start">
                <span className="text-zinc-500 mt-0.5">
                  <Package size={14} />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-brand-muted">Cursos</span>
                  <div className="flex flex-wrap gap-1">
                    {lead.cursosInteresse.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-md bg-white/40 dark:bg-zinc-800 text-brand-text dark:text-zinc-300 border border-brand-border/40 text-xs font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {lead.mensagem && (
              <div className="mt-1 p-3 rounded-lg bg-white/40 dark:bg-black/20 backdrop-blur-md text-sm text-brand-text dark:text-zinc-300 leading-relaxed border border-brand-border/60 dark:border-zinc-800">
                &ldquo;{lead.mensagem}&rdquo;
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Histórico de Interações
            </h3>
            <InteractionTimeline interacoes={lead.interacoes} />
          </div>

          {/* New interaction form */}
          <div
            className="rounded-xl border p-4 flex flex-col gap-3"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Nova Interação
            </h3>

            <select
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
            >
              {TIPO_INTERACAO.map((t) => (
                <option key={t.value} value={t.value} className="bg-brand-surface dark:bg-zinc-950 text-brand-text">
                  {t.label}
                </option>
              ))}
            </select>

            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm text-brand-text dark:text-white bg-white/40 dark:bg-black/20 backdrop-blur-md border-brand-border/60 dark:border-zinc-800 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all resize-none placeholder:text-brand-muted/70"
              rows={3}
              placeholder="Descreva o que aconteceu nessa interação..."
              value={novoConteudo}
              onChange={(e) => setNovoConteudo(e.target.value)}
            />

            <Button
              onClick={handleEnviarInteracao}
              disabled={sending}
              className="self-end text-white font-semibold"
              style={{ backgroundColor: 'var(--brand-accent)' }}
            >
              {sending ? 'Salvando...' : 'Registrar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-zinc-500 mt-0.5">{icon}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-zinc-500">{label}</span>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
