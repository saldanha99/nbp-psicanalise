'use client'

import { useState, useMemo } from 'react'
import {
  UserCheck, Users, Search, Plus, Phone, Mail, Calendar,
  ChevronRight, X, Loader2, CheckCircle, XCircle, Edit2,
  Trash2, FileText, UserPlus, Activity
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Psicanalista = {
  id: string
  nome: string
  email: string
  telefone: string | null
  ativo: boolean
  totalPacientes: number
  createdAt: string
}

type Paciente = {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  cpf: string | null
  dataNascimento: string | null
  status: string
  observacoes: string | null
  psicanalistaId: string | null
  psicanalistaNome: string | null
  createdAt: string
}

interface Props {
  psicanalistas: Psicanalista[]
  pacientes: Paciente[]
}

export function PsicanalistasClient({ psicanalistas: inicialPsicanalistas, pacientes: inicialPacientes }: Props) {
  const [activeTab, setActiveTab] = useState<'psicanalistas' | 'pacientes'>('psicanalistas')
  
  // States
  const [psicanalistas, setPsicanalistas] = useState<Psicanalista[]>(inicialPsicanalistas)
  const [pacientes, setPacientes] = useState<Paciente[]>(inicialPacientes)
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [analystFiltro, setAnalystFiltro] = useState('')

  // Modals
  const [showAnalystModal, setShowAnalystModal] = useState(false)
  const [editingAnalyst, setEditingAnalyst] = useState<Psicanalista | null>(null)
  const [analystForm, setAnalystForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    ativo: 'true',
  })

  const [showPatientModal, setShowPatientModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null)
  const [patientForm, setPatientForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    status: 'ativo',
    observacoes: '',
    psicanalistaId: '',
  })

  // Loading states
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filters logic
  const filteredPsicanalistas = useMemo(() => {
    return psicanalistas.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q || p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || (p.telefone ?? '').includes(q)
      const matchStatus = !statusFiltro || String(p.ativo) === statusFiltro
      return matchSearch && matchStatus
    })
  }, [psicanalistas, search, statusFiltro])

  const filteredPacientes = useMemo(() => {
    return pacientes.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q || p.nome.toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q) || (p.telefone ?? '').includes(q) || (p.cpf ?? '').includes(q)
      const matchStatus = !statusFiltro || p.status === statusFiltro
      const matchAnalyst = !analystFiltro || p.psicanalistaId === analystFiltro
      return matchSearch && matchStatus && matchAnalyst
    })
  }, [pacientes, search, statusFiltro, analystFiltro])

  // Form helper handlers
  const handleAnalystChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAnalystForm(f => ({ ...f, [k]: e.target.value }))

  const handlePatientChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setPatientForm(f => ({ ...f, [k]: e.target.value }))

  // CRUD Psicanalistas
  const openNewAnalyst = () => {
    setEditingAnalyst(null)
    setAnalystForm({ nome: '', email: '', telefone: '', ativo: 'true' })
    setShowAnalystModal(true)
  }

  const openEditAnalyst = (p: Psicanalista, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingAnalyst(p)
    setAnalystForm({
      nome: p.nome,
      email: p.email,
      telefone: p.telefone || '',
      ativo: String(p.ativo),
    })
    setShowAnalystModal(true)
  }

  const handleSaveAnalyst = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!analystForm.nome || !analystForm.email) {
      toast.error('Nome e E-mail são obrigatórios')
      return
    }

    setSaving(true)
    try {
      if (editingAnalyst) {
        // UPDATE
        const res = await fetch(`/api/admin/psicanalistas/${editingAnalyst.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...analystForm,
            ativo: analystForm.ativo === 'true',
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        const updated = await res.json()
        setPsicanalistas(prev => prev.map(item => item.id === editingAnalyst.id ? { ...item, ...updated } : item))
        toast.success('Psicanalista atualizado com sucesso!')
      } else {
        // CREATE
        const res = await fetch('/api/admin/psicanalistas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...analystForm,
            ativo: analystForm.ativo === 'true',
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        const created = await res.json()
        setPsicanalistas(prev => [{ ...created, totalPacientes: 0 }, ...prev])
        toast.success('Psicanalista cadastrado com sucesso!')
      }
      setShowAnalystModal(false)
    } catch (err) {
      toast.error('Erro ao salvar psicanalista')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAnalyst = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Deseja realmente remover este psicanalista? Os pacientes dele serão mantidos, mas ficarão sem profissional vinculado.')) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/psicanalistas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      setPsicanalistas(prev => prev.filter(item => item.id !== id))
      // Atualizar a listagem de pacientes localmente para remover o nome do psicanalista excluído
      setPacientes(prev => prev.map(p => p.psicanalistaId === id ? { ...p, psicanalistaId: null, psicanalistaNome: null } : p))
      toast.success('Psicanalista removido com sucesso!')
    } catch (err) {
      toast.error('Erro ao excluir psicanalista')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // CRUD Pacientes
  const openNewPatient = () => {
    setEditingPatient(null)
    setPatientForm({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      status: 'ativo',
      observacoes: '',
      psicanalistaId: '',
    })
    setShowPatientModal(true)
  }

  const openEditPatient = (p: Paciente, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setEditingPatient(p)
    setPatientForm({
      nome: p.nome,
      email: p.email || '',
      telefone: p.telefone || '',
      cpf: p.cpf || '',
      dataNascimento: p.dataNascimento || '',
      status: p.status,
      observacoes: p.observacoes || '',
      psicanalistaId: p.psicanalistaId || '',
    })
    setShowPatientModal(true)
  }

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientForm.nome) {
      toast.error('O nome do paciente é obrigatório')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...patientForm,
        psicanalistaId: patientForm.psicanalistaId || null,
        email: patientForm.email || null,
        telefone: patientForm.telefone || null,
        cpf: patientForm.cpf || null,
        dataNascimento: patientForm.dataNascimento || null,
        observacoes: patientForm.observacoes || null,
      }

      if (editingPatient) {
        // UPDATE
        const res = await fetch(`/api/admin/pacientes/${editingPatient.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(await res.text())
        const updated = await res.json()
        
        // Encontrar nome do psicanalista correspondente
        const analystName = psicanalistas.find(p => p.id === payload.psicanalistaId)?.nome || null
        
        setPacientes(prev => prev.map(item => item.id === editingPatient.id ? {
          ...item,
          ...updated,
          psicanalistaNome: analystName
        } : item))
        
        // Re-calcular contagem de pacientes ativos localmente
        setPsicanalistas(prev => prev.map(item => {
          const wasAssigned = editingPatient.psicanalistaId === item.id && editingPatient.status === 'ativo'
          const isAssigned = payload.psicanalistaId === item.id && payload.status === 'ativo'
          let count = item.totalPacientes
          if (wasAssigned && !isAssigned) count--
          if (!wasAssigned && isAssigned) count++
          return { ...item, totalPacientes: Math.max(0, count) }
        }))

        toast.success('Paciente atualizado com sucesso!')
      } else {
        // CREATE
        const res = await fetch('/api/admin/pacientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(await res.text())
        const created = await res.json()
        
        const analystName = psicanalistas.find(p => p.id === payload.psicanalistaId)?.nome || null
        setPacientes(prev => [{ ...created, psicanalistaNome: analystName }, ...prev])

        // Incrementar contagem local do psicanalista correspondente se ativo
        if (payload.psicanalistaId && payload.status === 'ativo') {
          setPsicanalistas(prev => prev.map(item => item.id === payload.psicanalistaId ? { ...item, totalPacientes: item.totalPacientes + 1 } : item))
        }

        toast.success('Paciente cadastrado com sucesso!')
      }
      setShowPatientModal(false)
    } catch (err) {
      toast.error('Erro ao salvar paciente')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePatient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!confirm('Deseja realmente excluir este paciente?')) {
      return
    }

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/pacientes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())
      
      const target = pacientes.find(p => p.id === id)
      setPacientes(prev => prev.filter(item => item.id !== id))

      // Decrementar contagem local do psicanalista correspondente se o paciente deletado era ativo
      if (target && target.psicanalistaId && target.status === 'ativo') {
        setPsicanalistas(prev => prev.map(item => item.id === target.psicanalistaId ? { ...item, totalPacientes: Math.max(0, item.totalPacientes - 1) } : item))
      }

      toast.success('Paciente excluído com sucesso!')
    } catch (err) {
      toast.error('Erro ao excluir paciente')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-24 md:pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <UserCheck size={20} className="text-brand-accent" /> Clínica Didática e Consultórios
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Gestão de psicanalistas formandos e seus respectivos pacientes ativos
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'psicanalistas' ? (
            <button
              onClick={openNewAnalyst}
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-accent/20 active:scale-[0.98]"
            >
              <Plus size={16} /> Novo Psicanalista
            </button>
          ) : (
            <button
              onClick={openNewPatient}
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-accent/20 active:scale-[0.98]"
            >
              <UserPlus size={16} /> Novo Paciente
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border gap-2">
        <button
          onClick={() => { setActiveTab('psicanalistas'); setSearch(''); setStatusFiltro('') }}
          className={cn(
            "pb-3 text-sm font-semibold px-4 relative transition-colors",
            activeTab === 'psicanalistas'
              ? "text-brand-accent"
              : "text-brand-muted hover:text-brand-text"
          )}
        >
          Psicanalistas ({psicanalistas.length})
          {activeTab === 'psicanalistas' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full animate-fade-in" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('pacientes'); setSearch(''); setStatusFiltro(''); setAnalystFiltro('') }}
          className={cn(
            "pb-3 text-sm font-semibold px-4 relative transition-colors",
            activeTab === 'pacientes'
              ? "text-brand-accent"
              : "text-brand-muted hover:text-brand-text"
          )}
        >
          Todos os Pacientes ({pacientes.length})
          {activeTab === 'pacientes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent rounded-full animate-fade-in" />
          )}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={
              activeTab === 'psicanalistas'
                ? "Buscar psicanalista por nome, e-mail ou telefone..."
                : "Buscar paciente por nome, e-mail, telefone ou CPF..."
            }
            className="w-full pl-8 pr-3 py-2 bg-brand-surface-2 border border-brand-border rounded-xl text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50"
          />
        </div>
        
        {/* Filtro de Status */}
        <select
          value={statusFiltro}
          onChange={e => setStatusFiltro(e.target.value)}
          className="bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          {activeTab === 'psicanalistas' && <option value="false">Inativos (sistema)</option>}
        </select>

        {/* Filtro por Psicanalista (somente na aba pacientes) */}
        {activeTab === 'pacientes' && (
          <select
            value={analystFiltro}
            onChange={e => setAnalystFiltro(e.target.value)}
            className="bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50 max-w-[240px]"
          >
            <option value="">Todos os psicanalistas</option>
            {psicanalistas.map(p => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        )}

        {(search || statusFiltro || analystFiltro) && (
          <button
            onClick={() => { setSearch(''); setStatusFiltro(''); setAnalystFiltro('') }}
            className="flex items-center gap-1 text-xs text-brand-muted hover:text-brand-text px-2.5 py-2 rounded-xl hover:bg-brand-surface-2 transition-colors border border-dashed border-brand-border"
          >
            <X size={12} /> Limpar Filtros
          </button>
        )}

        <span className="text-xs text-brand-muted ml-auto font-medium">
          {activeTab === 'psicanalistas' ? filteredPsicanalistas.length : filteredPacientes.length} resultado(s)
        </span>
      </div>

      {/* Grid Psicanalistas */}
      {activeTab === 'psicanalistas' && (
        filteredPsicanalistas.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-2xl text-brand-muted">
            <Users size={40} className="mx-auto mb-3 opacity-30 text-brand-accent" />
            <p className="font-semibold text-brand-text">Nenhum psicanalista encontrado</p>
            <p className="text-xs mt-1">Crie um novo profissional ou ajuste seus termos de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPsicanalistas.map(p => (
              <div
                key={p.id}
                className="group bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-accent/30 hover:bg-brand-surface-2/30 transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border shadow-inner",
                        p.ativo
                          ? "bg-brand-accent/15 border-brand-accent/35 text-brand-accent"
                          : "bg-red-500/10 border-red-500/25 text-red-400"
                      )}>
                        {p.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-text text-sm transition-colors group-hover:text-brand-accent leading-snug">
                          {p.nome}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {p.ativo ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                              <CheckCircle size={10} /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400">
                              <XCircle size={10} /> Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditAnalyst(p, e)}
                        className="w-7 h-7 rounded-lg bg-brand-surface-2 hover:bg-brand-accent hover:text-white border border-brand-border flex items-center justify-center text-brand-muted transition-all"
                        title="Editar"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        disabled={deletingId === p.id}
                        onClick={(e) => handleDeleteAnalyst(p.id, e)}
                        className="w-7 h-7 rounded-lg bg-brand-surface-2 hover:bg-red-500/10 hover:text-red-400 border border-brand-border flex items-center justify-center text-brand-muted transition-all disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 pt-1">
                    <div className="flex items-center gap-2 text-xs text-brand-muted truncate">
                      <Mail size={12} className="text-brand-accent/60" /> {p.email}
                    </div>
                    {p.telefone && (
                      <div className="flex items-center gap-2 text-xs text-brand-muted">
                        <Phone size={12} className="text-brand-accent/60" /> {p.telefone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs mt-2">
                  <span className="text-brand-muted flex items-center gap-1.5 font-medium">
                    <Activity size={12} className="text-brand-accent" />
                    <span className="text-brand-text font-bold">{p.totalPacientes}</span> paciente(s) ativo(s)
                  </span>
                  <button
                    onClick={() => { setActiveTab('pacientes'); setAnalystFiltro(p.id) }}
                    className="text-brand-accent hover:underline font-semibold flex items-center gap-0.5 text-[11px]"
                  >
                    Ver clínica <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Grid Pacientes */}
      {activeTab === 'pacientes' && (
        filteredPacientes.length === 0 ? (
          <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-2xl text-brand-muted">
            <Users size={40} className="mx-auto mb-3 opacity-30 text-brand-accent" />
            <p className="font-semibold text-brand-text">Nenhum paciente encontrado</p>
            <p className="text-xs mt-1">Cadastre um paciente ou altere os filtros ativos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPacientes.map(pac => (
              <div
                key={pac.id}
                className="group bg-brand-surface border border-brand-border rounded-2xl p-5 hover:border-brand-accent/30 hover:bg-brand-surface-2/30 transition-all duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold border shadow-inner",
                        pac.status === 'ativo'
                          ? "bg-brand-accent/15 border-brand-accent/35 text-brand-accent"
                          : "bg-red-500/10 border-red-500/25 text-red-400"
                      )}>
                        {pac.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-text text-sm transition-colors group-hover:text-brand-accent leading-snug">
                          {pac.nome}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          {pac.status === 'ativo' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                              <CheckCircle size={10} /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400">
                              <XCircle size={10} /> Inativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEditPatient(pac, e)}
                        className="w-7 h-7 rounded-lg bg-brand-surface-2 hover:bg-brand-accent hover:text-white border border-brand-border flex items-center justify-center text-brand-muted transition-all"
                        title="Editar"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        disabled={deletingId === pac.id}
                        onClick={(e) => handleDeletePatient(pac.id, e)}
                        className="w-7 h-7 rounded-lg bg-brand-surface-2 hover:bg-red-500/10 hover:text-red-400 border border-brand-border flex items-center justify-center text-brand-muted transition-all disabled:opacity-50"
                        title="Excluir"
                      >
                        {deletingId === pac.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 pt-1">
                    {pac.email && (
                      <div className="flex items-center gap-2 text-xs text-brand-muted truncate">
                        <Mail size={12} className="text-brand-accent/60" /> {pac.email}
                      </div>
                    )}
                    {pac.telefone && (
                      <div className="flex items-center gap-2 text-xs text-brand-muted">
                        <Phone size={12} className="text-brand-accent/60" /> {pac.telefone}
                      </div>
                    )}
                    {pac.cpf && (
                      <div className="flex items-center gap-2 text-[11px] text-brand-muted font-mono">
                        CPF: {pac.cpf}
                      </div>
                    )}
                    {pac.observacoes && (
                      <div className="text-xs text-brand-muted/80 bg-brand-surface-2/50 border border-brand-border/40 rounded-xl p-2.5 mt-2 line-clamp-2">
                        {pac.observacoes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/60 flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between text-[10px] text-brand-muted font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Nascimento: {pac.dataNascimento ? new Date(pac.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não inf.'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1 justify-between bg-brand-surface-2/40 border border-brand-border/60 rounded-xl px-2.5 py-1.5">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Atendido por:</span>
                    {pac.psicanalistaId ? (
                      <span className="text-xs font-semibold text-brand-text bg-brand-accent/10 border border-brand-accent/25 rounded-lg px-2 py-0.5 text-right max-w-[170px] truncate">
                        {pac.psicanalistaNome}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-0.5">
                        Nenhum psicanalista
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal Psicanalista */}
      {showAnalystModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setShowAnalystModal(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
              <h2 className="font-bold text-brand-text flex items-center gap-2">
                <UserCheck size={18} className="text-brand-accent" />
                {editingAnalyst ? 'Editar Psicanalista' : 'Novo Psicanalista'}
              </h2>
              <button
                onClick={() => setShowAnalystModal(false)}
                className="w-8 h-8 rounded-lg bg-brand-surface-2 hover:bg-red-500/10 hover:text-red-400 text-brand-muted flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAnalyst} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Nome Completo *</label>
                <input
                  value={analystForm.nome}
                  onChange={handleAnalystChange('nome')}
                  required
                  placeholder="Ex: Dra. Ana Souza"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">E-mail *</label>
                <input
                  type="email"
                  value={analystForm.email}
                  onChange={handleAnalystChange('email')}
                  required
                  placeholder="ana.souza@email.com"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Telefone / WhatsApp</label>
                <input
                  value={analystForm.telefone}
                  onChange={handleAnalystChange('telefone')}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Status Ativo (Sistema)</label>
                <select
                  value={analystForm.ativo}
                  onChange={handleAnalystChange('ativo')}
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAnalystModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:bg-brand-surface-2 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Paciente */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setShowPatientModal(false)} />
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-brand-border sticky top-0 bg-brand-surface z-10">
              <h2 className="font-bold text-brand-text flex items-center gap-2">
                <Users size={18} className="text-brand-accent" />
                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </h2>
              <button
                onClick={() => setShowPatientModal(false)}
                className="w-8 h-8 rounded-lg bg-brand-surface-2 hover:bg-red-500/10 hover:text-red-400 text-brand-muted flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Nome do Paciente *</label>
                <input
                  value={patientForm.nome}
                  onChange={handlePatientChange('nome')}
                  required
                  placeholder="Ex: Sigmund Freud"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Psicanalista Responsável *</label>
                <select
                  value={patientForm.psicanalistaId}
                  onChange={handlePatientChange('psicanalistaId')}
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="">Nenhum (Clínica Didática / Sem profissional)</option>
                  {psicanalistas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.ativo ? '' : '(Inativo)'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-muted mt-1 leading-snug">
                  Associe este paciente a um psicanalista formando ou de carreira.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">E-mail</label>
                  <input
                    type="email"
                    value={patientForm.email}
                    onChange={handlePatientChange('email')}
                    placeholder="paciente@email.com"
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Telefone</label>
                  <input
                    value={patientForm.telefone}
                    onChange={handlePatientChange('telefone')}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">CPF</label>
                  <input
                    value={patientForm.cpf}
                    onChange={handlePatientChange('cpf')}
                    placeholder="000.000.000-00"
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Data de Nascimento</label>
                  <input
                    type="date"
                    value={patientForm.dataNascimento}
                    onChange={handlePatientChange('dataNascimento')}
                    className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Status Clínico</label>
                <select
                  value={patientForm.status}
                  onChange={handlePatientChange('status')}
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2.5 text-sm text-brand-text focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-muted mb-1.5 uppercase tracking-wide">Observações do Caso</label>
                <textarea
                  value={patientForm.observacoes}
                  onChange={handlePatientChange('observacoes')}
                  placeholder="Histórico clínico básico, queixas principais ou anotações internas..."
                  rows={3}
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-brand-border text-brand-muted hover:bg-brand-surface-2 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
