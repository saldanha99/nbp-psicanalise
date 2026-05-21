'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Users, Search, Plus, Phone, Mail, Calendar, ChevronRight, X, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Aluno = {
  id: string
  nome: string
  telefone: string | null
  email: string
  cpf: string | null
  ativo: boolean
  createdAt: string
}

interface Props {
  clientes: Aluno[] // mantemos o nome da prop por conta do page.tsx correspondente
}

export function ClientesClient({ clientes: inicial }: Props) {
  const [alunos, setAlunos] = useState<Aluno[]>(inicial)
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    ativo: 'true',
  })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const filtered = useMemo(() => {
    return alunos.filter(a => {
      const q = search.toLowerCase()
      const matchSearch = !q || a.nome.toLowerCase().includes(q) || (a.email ?? '').toLowerCase().includes(q) || (a.telefone ?? '').includes(q) || (a.cpf ?? '').includes(q)
      const matchStatus = !statusFiltro || String(a.ativo) === statusFiltro
      return matchSearch && matchStatus
    })
  }, [alunos, search, statusFiltro])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.email) {
      toast.error('Nome e E-mail são obrigatórios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          ativo: form.ativo === 'true',
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const a = await res.json()
      setAlunos(prev => [a, ...prev])
      setShowModal(false)
      setForm({ nome: '', email: '', telefone: '', cpf: '', ativo: 'true' })
      toast.success('Aluno cadastrado com sucesso!')
    } catch (err) {
      toast.error('Erro ao cadastrar aluno')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <Users size={20} className="text-brand-accent" /> Alunos (Portal EAD)
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">{alunos.length} alunos cadastrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-accent/20"
        >
          <Plus size={16} /> Novo Aluno
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nome, e-mail, telefone ou CPF..."
            className="w-full pl-8 pr-3 py-2.5 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
          />
        </div>
        <select
          value={statusFiltro}
          onChange={e => setStatusFiltro(e.target.value)}
          className="bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
        >
          <option value="" className="bg-white dark:bg-zinc-950 text-brand-text">Todos os status</option>
          <option value="true" className="bg-white dark:bg-zinc-950 text-brand-text">Ativos</option>
          <option value="false" className="bg-white dark:bg-zinc-950 text-brand-text">Inativos</option>
        </select>
        {(search || statusFiltro) && (
          <button
            onClick={() => { setSearch(''); setStatusFiltro('') }}
            className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-text px-2 py-2 rounded-lg hover:bg-brand-surface-2 transition-colors"
          >
            <X size={12} /> Limpar
          </button>
        )}
        <span className="text-xs text-brand-muted ml-auto">{filtered.length} resultado(s)</span>
      </div>

      {/* Lista de Alunos */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum aluno encontrado</p>
          <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo aluno</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(a => (
            <Link
              key={a.id}
              href={`/admin/clientes/${a.id}`}
              className="group bg-brand-surface border border-brand-border rounded-2xl p-4 hover:border-brand-accent/30 hover:bg-brand-surface-2/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border",
                    a.ativo
                      ? "bg-brand-accent/10 border-brand-accent/20 text-brand-accent"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {a.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text text-sm group-hover:text-brand-accent transition-colors">{a.nome}</p>
                    <p className="text-xs text-brand-muted">
                      {a.ativo ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Ativo</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1"><XCircle size={10} /> Inativo</span>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-brand-muted group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all mt-1" />
              </div>

              <div className="space-y-1.5 mb-3">
                {a.email && (
                  <div className="flex items-center gap-2 text-xs text-brand-muted truncate">
                    <Mail size={11} /> {a.email}
                  </div>
                )}
                {a.telefone && (
                  <div className="flex items-center gap-2 text-xs text-brand-muted">
                    <Phone size={11} /> {a.telefone}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between text-[10px] text-brand-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  Cadastro: {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                </span>
                {a.cpf && (
                  <span className="font-mono">CPF: {a.cpf}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Novo Aluno */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
              <h2 className="font-semibold text-brand-text">Novo Aluno</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-brand-surface-2 hover:bg-red-500/10 hover:text-red-400 text-brand-muted flex items-center justify-center transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">Nome Completo *</label>
                <input
                  value={form.nome}
                  onChange={set('nome')}
                  required
                  placeholder="Ex: Sigmund Freud"
                  className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  placeholder="exemplo@email.com"
                  className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={set('telefone')}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">CPF</label>
                  <input
                    value={form.cpf}
                    onChange={set('cpf')}
                    placeholder="000.000.000-00"
                    className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text dark:text-white placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-muted mb-1.5">Status</label>
                <select
                  value={form.ativo}
                  onChange={set('ativo')}
                  className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-brand-border/60 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20 transition-all"
                >
                  <option value="true" className="bg-white dark:bg-zinc-950 text-brand-text">Ativo</option>
                  <option value="false" className="bg-white dark:bg-zinc-950 text-brand-text">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-brand-border/60 dark:border-zinc-800 text-brand-muted hover:bg-white/10 dark:hover:bg-white/5 text-sm font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
