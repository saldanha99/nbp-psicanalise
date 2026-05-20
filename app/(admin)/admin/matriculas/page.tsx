import { Suspense } from 'react'
import { db } from '@/lib/db'
import { matriculas, alunos, cursos, pedidos } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { Metadata } from 'next'
import { CheckCircle2, Clock, Users, BookOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'Matrículas' }
export const dynamic = 'force-dynamic'

async function MatriculasContent() {
  const lista = await db
    .select({
      id: matriculas.id,
      status: matriculas.status,
      progressoPercent: matriculas.progressoPercent,
      createdAt: matriculas.createdAt,
      alunoNome: alunos.nome,
      alunoEmail: alunos.email,
      cursoNome: cursos.nome,
      cursoSlug: cursos.slug,
    })
    .from(matriculas)
    .innerJoin(alunos, eq(matriculas.alunoId, alunos.id))
    .innerJoin(cursos, eq(matriculas.cursoId, cursos.id))
    .orderBy(desc(matriculas.createdAt))
    .limit(200)

  const stats = {
    total: lista.length,
    ativos: lista.filter(m => m.status === 'ativo').length,
    concluidos: lista.filter(m => m.progressoPercent === 100).length,
  }

  return (
    <div className="p-6 pb-24 md:pb-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-brand-text uppercase mb-6">
        Matrículas
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4">
          <Users className="w-8 h-8 text-brand-accent" />
          <div>
            <div className="text-2xl font-bold text-brand-text">{stats.total}</div>
            <div className="text-xs text-brand-muted">Total</div>
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4">
          <Clock className="w-8 h-8 text-blue-400" />
          <div>
            <div className="text-2xl font-bold text-brand-text">{stats.ativos}</div>
            <div className="text-xs text-brand-muted">Ativos</div>
          </div>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl p-4 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
          <div>
            <div className="text-2xl font-bold text-brand-text">{stats.concluidos}</div>
            <div className="text-xs text-brand-muted">Concluídos</div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Aluno</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Curso</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Progresso</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Data</th>
                <th className="text-left px-4 py-3 text-brand-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(m => (
                <tr key={m.id} className="border-b border-brand-border/50 hover:bg-brand-surface-2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-text">{m.alunoNome}</div>
                    <div className="text-xs text-brand-muted">{m.alunoEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-text">{m.cursoNome}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-brand-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent rounded-full" style={{ width: `${m.progressoPercent}%` }} />
                      </div>
                      <span className="text-xs text-brand-muted">{m.progressoPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-muted text-xs">
                    {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                      m.status === 'ativo' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {m.status === 'ativo' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function MatriculasPage() {
  return (
    <Suspense fallback={<div className="p-6 text-brand-muted">Carregando matrículas...</div>}>
      <MatriculasContent />
    </Suspense>
  )
}
