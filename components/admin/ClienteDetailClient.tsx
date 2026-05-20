'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar, Plus, Trash2, Edit3, Save, X, Loader2, ExternalLink, ShieldCheck, SaveAll } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

type Matricula = {
  id: string
  cursoId: string
  cursoNome: string
  status: string
  progresso: number
  dataMatricula: string
}

type Pedido = {
  id: string
  status: string
  valor: string | number
  formaPagamento: string | null
  createdAt: string
  urlFatura?: string | null
}

type Registro = {
  id: string
  tipo: string
  data: string
  horas: number
  supervisor: string | null
  conteudo: string
  createdAt: string
}

type Aluno = {
  id: string
  nome: string
  telefone: string | null
  email: string
  cpf: string | null
  ativo: boolean
  createdAt: string
  matriculas: Matricula[]
  pedidos: Pedido[]
  registros: Registro[]
}

interface Props {
  cliente: Aluno // Mantemos a prop como cliente para compatibilidade com o page.tsx original
}

const TIPO_REGISTRO_LABEL: Record<string, string> = {
  supervisao: 'Supervisão Clínica',
  analise_pessoal: 'Análise Pessoal',
  observacao_academica: 'Observação Acadêmica',
}

const TIPO_REGISTRO_COLOR: Record<string, string> = {
  supervisao: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  analise_pessoal: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  observacao_academica: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export function ClienteDetailClient({ cliente: initial }: Props) {
  const [aluno, setAluno] = useState<Aluno>(initial)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    nome: initial.nome,
    telefone: initial.telefone ?? '',
    email: initial.email,
    cpf: initial.cpf ?? '',
    ativo: initial.ativo,
  })

  // Prontuários / Registros de Clínicas e Supervisões
  const [showAddRegistro, setShowAddRegistro] = useState(false)
  const [registroForm, setRegistroForm] = useState({
    tipo: 'supervisao',
    data: new Date().toISOString().split('T')[0],
    horas: '1',
    supervisor: '',
    conteudo: '',
  })
  const [savingRegistro, setSavingRegistro] = useState(false)

  const setEdit = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value
    setEditForm(f => ({
      ...f,
      [k]: k === 'ativo' ? value === 'true' : value,
    }))
  }

  const setReg = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setRegistroForm(f => ({ ...f, [k]: e.target.value }))
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/clientes/${aluno.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setAluno(a => ({ ...a, ...updated }))
      setEditing(false)
      toast.success('Perfil do aluno atualizado!')
    } catch {
      toast.error('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registroForm.conteudo) {
      toast.error('As anotações/relatório são obrigatórias')
      return
    }
    setSavingRegistro(true)
    try {
      const res = await fetch(`/api/admin/alunos/${aluno.id}/registros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: registroForm.tipo,
          data: registroForm.data,
          horas: Number(registroForm.horas),
          supervisor: registroForm.supervisor || null,
          conteudo: registroForm.conteudo,
        }),
      })
      if (!res.ok) throw new Error()
      const novoRegistro = await res.json()
      setAluno(a => ({
        ...a,
        registros: [novoRegistro, ...a.registros],
      }))
      setRegistroForm({
        tipo: 'supervisao',
        data: new Date().toISOString().split('T')[0],
        horas: '1',
        supervisor: '',
        conteudo: '',
      })
      setShowAddRegistro(false)
      toast.success('Horas clínicas / observação registradas com sucesso!')
    } catch {
      toast.error('Erro ao salvar registro')
    } finally {
      setSavingRegistro(false)
    }
  }

  const handleDeleteRegistro = async (registroId: string) => {
    if (!confirm('Remover esta entrada de prontuário/supervisão? Esta ação é irreversível.')) return
    try {
      const res = await fetch(`/api/admin/alunos/${aluno.id}/registros?registroId=${registroId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setAluno(a => ({
        ...a,
        registros: a.registros.filter(r => r.id !== registroId),
      }))
      toast.success('Registro removido')
    } catch {
      toast.error('Erro ao remover registro')
    }
  }

  // Horas Totais
  const totalSupervisao = aluno.registros
    .filter(r => r.tipo === 'supervisao')
    .reduce((acc, curr) => acc + Number(curr.horas || 0), 0)

  const totalAnalise = aluno.registros
    .filter(r => r.tipo === 'analise_pessoal')
    .reduce((acc, curr) => acc + Number(curr.horas || 0), 0)

  const whatsappLink = aluno.telefone ? `https://wa.me/55${aluno.telefone.replace(/\D/g, '')}` : null

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-10">
      {/* Back */}
      <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-text text-sm transition-colors">
        <ArrowLeft size={14} /> Voltar para Alunos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white bg-brand-accent/20 border border-brand-accent/30 text-brand-accent">
            {aluno.nome.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
              {aluno.nome}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${aluno.ativo ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {aluno.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </h1>
            <p className="text-xs text-brand-muted mt-0.5">Aluno da Formação em Psicanálise</p>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
              {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors">
                  <Phone size={11} /> {aluno.telefone}
                </a>
              ) : (
                <span className="text-xs text-brand-muted/50">Sem telefone</span>
              )}
              <span className="flex items-center gap-1 text-xs text-brand-muted">
                <Mail size={11} /> {aluno.email}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="w-9 h-9 rounded-xl bg-brand-surface-2 border border-brand-border text-brand-muted hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-colors">
                <X size={16} />
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-brand-accent/25">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-muted hover:text-brand-text text-sm px-4 py-2 rounded-xl transition-colors">
              <Edit3 size={14} /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lado Esquerdo - Detalhes do Perfil, Matrículas e Pedidos */}
        <div className="lg:col-span-2 space-y-5">
          {/* Informações Pessoais */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="font-semibold text-brand-text mb-4 text-xs tracking-wider uppercase text-brand-muted">Ficha Cadastral</h2>
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">Nome Completo</label>
                  <input type="text" value={editForm.nome} onChange={setEdit('nome')}
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">E-mail</label>
                  <input type="email" value={editForm.email} onChange={setEdit('email')}
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">Telefone</label>
                  <input type="text" value={editForm.telefone} onChange={setEdit('telefone')}
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">CPF</label>
                  <input type="text" value={editForm.cpf} onChange={setEdit('cpf')}
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-muted mb-1.5">Status do Aluno</label>
                  <select value={String(editForm.ativo)} onChange={setEdit('ativo')}
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 transition-colors">
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-brand-muted mb-0.5">Nome Completo</dt>
                  <dd className="text-brand-text font-medium">{aluno.nome}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted mb-0.5">E-mail de Acesso</dt>
                  <dd className="text-brand-text font-medium">{aluno.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted mb-0.5">Telefone</dt>
                  <dd className="text-brand-text font-medium">
                    {aluno.telefone ? (
                      <a href={whatsappLink || '#'} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 inline-flex items-center gap-1">
                        {aluno.telefone} <ExternalLink size={10} />
                      </a>
                    ) : 'Não informado'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted mb-0.5">CPF</dt>
                  <dd className="text-brand-text font-mono font-medium">{aluno.cpf || 'Não cadastrado'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-muted mb-0.5">Data de Matrícula</dt>
                  <dd className="text-brand-text font-medium">{new Date(aluno.createdAt).toLocaleDateString('pt-BR')}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Matrículas / Cursos */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-text text-xs tracking-wider uppercase text-brand-muted flex items-center gap-2">
                <ShieldCheck size={14} className="text-brand-accent" /> Cursos Matriculados
              </h2>
              <span className="text-xs text-brand-muted bg-brand-surface-2 px-2.5 py-1 rounded-lg border border-brand-border">
                {aluno.matriculas.length} curso(s)
              </span>
            </div>

            {aluno.matriculas.length === 0 ? (
              <p className="text-center text-brand-muted text-sm py-8">Nenhum curso matriculado para este aluno</p>
            ) : (
              <div className="space-y-3">
                {aluno.matriculas.map(mat => (
                  <div key={mat.id} className="p-4 rounded-xl bg-brand-surface-2 border border-brand-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="font-semibold text-brand-text text-sm">{mat.cursoNome}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border self-start sm:self-auto uppercase tracking-wide ${
                        mat.status === 'concluido'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : mat.status === 'ativo'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : 'bg-brand-muted/10 border-brand-border text-brand-muted'
                      }`}>
                        {mat.status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-brand-muted mb-1">
                          <span>Progresso do Curso</span>
                          <span className="font-semibold tabular-nums">{mat.progresso}%</span>
                        </div>
                        <div className="w-full bg-brand-border rounded-full h-1.5 overflow-hidden">
                          <div className="bg-brand-accent h-full rounded-full transition-all duration-300" style={{ width: `${mat.progresso}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-muted whitespace-nowrap self-end">
                        Desde {new Date(mat.dataMatricula).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico Financeiro / Pedidos */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <h2 className="font-semibold text-brand-text mb-4 text-xs tracking-wider uppercase text-brand-muted">Histórico de Cobranças (Asaas)</h2>
            {aluno.pedidos.length === 0 ? (
              <p className="text-center text-brand-muted text-sm py-8">Nenhum pedido ou pagamento registrado</p>
            ) : (
              <div className="space-y-2">
                {aluno.pedidos.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-brand-surface-2 border border-brand-border hover:bg-brand-surface-2/70 transition-all">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-brand-text">
                          {formatCurrency(Number(p.valor))}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          p.status === 'pago' || p.status === 'CONFIRMED' || p.status === 'RECEIVED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : p.status === 'pendente' || p.status === 'PENDING'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {p.status === 'CONFIRMED' || p.status === 'RECEIVED' || p.status === 'pago' ? 'Pago' : p.status === 'PENDING' || p.status === 'pendente' ? 'Pendente' : p.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-brand-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{p.formaPagamento ? p.formaPagamento.toLowerCase() : 'Não informado'}</span>
                      </div>
                    </div>

                    {p.urlFatura && (
                      <a href={p.urlFatura} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs text-brand-accent hover:underline font-semibold bg-brand-accent/10 hover:bg-brand-accent/20 px-3 py-1.5 rounded-lg border border-brand-accent/20 transition-all shrink-0">
                        Visualizar Fatura <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito - Registro de Horas Clínicas / Supervisão */}
        <div className="space-y-4">
          {/* Painel de Prontuário / Clínicas */}
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-brand-text text-xs tracking-wider uppercase text-brand-muted flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-brand-accent" /> Registro de Horas
              </h2>
              <button
                onClick={() => setShowAddRegistro(!showAddRegistro)}
                className="w-7 h-7 rounded-lg bg-brand-surface-2 border border-brand-border text-brand-muted hover:text-brand-accent hover:border-brand-accent/30 flex items-center justify-center transition-colors"
              >
                {showAddRegistro ? <X size={13} /> : <Plus size={13} />}
              </button>
            </div>

            {/* KPI Cards de Horas */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 text-center">
                <p className="text-blue-400 font-bold text-xl tabular-nums">{totalSupervisao}h</p>
                <p className="text-brand-muted text-[10px] mt-0.5">Supervisão Clínica</p>
              </div>
              <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 text-center">
                <p className="text-purple-400 font-bold text-xl tabular-nums">{totalAnalise}h</p>
                <p className="text-brand-muted text-[10px] mt-0.5">Análise Pessoal</p>
              </div>
            </div>

            {/* Form de Novo Registro */}
            {showAddRegistro && (
              <form onSubmit={handleAddRegistro} className="mb-4 p-4 bg-brand-surface-2 border border-brand-border rounded-xl space-y-3">
                <p className="text-xs font-semibold text-brand-text">Adicionar Horas / Relato</p>
                
                <div>
                  <label className="text-[10px] text-brand-muted mb-1 block">Tipo de Atividade</label>
                  <select value={registroForm.tipo} onChange={setReg('tipo')}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-2.5 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent/50">
                    <option value="supervisao">Supervisão Clínica</option>
                    <option value="analise_pessoal">Análise Pessoal</option>
                    <option value="observacao_academica">Observação Acadêmica / Notas</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-brand-muted mb-1 block">Data da Sessão</label>
                    <input type="date" value={registroForm.data} onChange={setReg('data')} required
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-2.5 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-muted mb-1 block">Quantidade de Horas</label>
                    <input type="number" min="0" step="0.5" value={registroForm.horas} onChange={setReg('horas')} required
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-2.5 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent/50"
                    />
                  </div>
                </div>

                {registroForm.tipo === 'supervisao' && (
                  <div>
                    <label className="text-[10px] text-brand-muted mb-1 block">Nome do Supervisor</label>
                    <input type="text" value={registroForm.supervisor} onChange={setReg('supervisor')} placeholder="Ex: Dr. Lacan"
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-2.5 py-2 text-xs text-brand-text focus:outline-none focus:border-brand-accent/50"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-brand-muted mb-1 block">Anotações / Relatório Clínico *</label>
                  <textarea value={registroForm.conteudo} onChange={setReg('conteudo')} rows={4} required placeholder="Insira o resumo das observações da sessão..."
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-2.5 py-2 text-xs text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-accent/50 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddRegistro(false)} className="flex-1 py-2 text-xs rounded-lg border border-brand-border text-brand-muted hover:bg-brand-surface transition-colors">Cancelar</button>
                  <button type="submit" disabled={savingRegistro} className="flex-1 py-2 text-xs rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white font-medium flex items-center justify-center gap-1 transition-colors">
                    {savingRegistro ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Registrar
                  </button>
                </div>
              </form>
            )}

            {/* Listagem de Registros */}
            {aluno.registros.length === 0 ? (
              <p className="text-center text-brand-muted text-xs py-8">Nenhum prontuário ou horas registradas para este aluno.</p>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {aluno.registros.map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-brand-surface-2 border border-brand-border space-y-2.5 group relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${TIPO_REGISTRO_COLOR[r.tipo] || 'text-brand-muted bg-brand-surface border-brand-border'}`}>
                        {TIPO_REGISTRO_LABEL[r.tipo] || r.tipo}
                      </span>
                      <button
                        onClick={() => handleDeleteRegistro(r.id)}
                        className="w-6 h-6 rounded-lg md:opacity-0 group-hover:opacity-100 text-brand-muted hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all absolute top-2 right-2"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs text-brand-text whitespace-pre-wrap leading-relaxed">{r.conteudo}</p>
                      
                      {r.supervisor && (
                        <p className="text-[10px] text-brand-muted font-medium">Supervisor: <span className="text-brand-text">{r.supervisor}</span></p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-[9px] text-brand-muted">
                      <span className="flex items-center gap-1"><Calendar size={9} /> {new Date(r.data).toLocaleDateString('pt-BR')}</span>
                      {r.horas > 0 && <span className="font-semibold text-brand-text tabular-nums">{r.horas}h registradas</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
