import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { matriculas, cursos, configuracoes, alunoRegistros } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Award, Clock, PlayCircle, ChevronRight, LogOut, User } from 'lucide-react'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? 'nbp-aluno-secret-fallback')

async function getAluno() {
  const cookieStore = await cookies()
  const token = cookieStore.get('aluno_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return { id: payload.sub as string, nome: payload.nome as string, email: payload.email as string }
  } catch {
    return null
  }
}

export default async function MinhaAreaPage() {
  const aluno = await getAluno()
  if (!aluno) redirect('/minha-area/auth/login')

  // Buscar matrículas
  const [minhasMatriculas, registros, configs] = await Promise.all([
    db
      .select({
        matriculaId: matriculas.id,
        status: matriculas.status,
        progressoPercent: matriculas.progressoPercent,
        certificadoUrl: matriculas.certificadoUrl,
        certificadoAt: matriculas.certificadoAt,
        createdAt: matriculas.createdAt,
        cursoId: cursos.id,
        cursoNome: cursos.nome,
        cursoSlug: cursos.slug,
        cursoFoto: cursos.fotoDestaque,
        cursoCategoria: cursos.categoria,
        cargaHoraria: cursos.cargaHoraria,
        certificadoOk: cursos.certificado,
      })
      .from(matriculas)
      .innerJoin(cursos, eq(matriculas.cursoId, cursos.id))
      .where(and(eq(matriculas.alunoId, aluno.id), eq(matriculas.status, 'ativo'))),

    db
      .select({
        tipo: alunoRegistros.tipo,
        horas: alunoRegistros.horas,
      })
      .from(alunoRegistros)
      .where(eq(alunoRegistros.alunoId, aluno.id)),

    db
      .select({
        chave: configuracoes.chave,
        valor: configuracoes.valor,
      })
      .from(configuracoes),
  ])

  // Calcular horas práticas
  const supervisaoHoras = registros.filter(r => r.tipo === 'supervisao').reduce((sum, r) => sum + r.horas, 0)
  const analiseHoras = registros.filter(r => r.tipo === 'analise_pessoal').reduce((sum, r) => sum + r.horas, 0)
  const observacaoHoras = registros.filter(r => r.tipo === 'observacao_academica').reduce((sum, r) => sum + r.horas, 0)

  // Metas de horas configuradas
  const progressoAtivo = configs.find(c => c.chave === 'cashback_ativo')?.valor !== 'false'
  const supervisaoTarget = Math.max(1, parseInt(configs.find(c => c.chave === 'roleta_min_cashback')?.valor ?? '100', 10))
  const analiseTarget = Math.max(1, parseInt(configs.find(c => c.chave === 'cashback_percentual')?.valor ?? '50', 10))
  const observacaoTarget = Math.max(1, parseInt(configs.find(c => c.chave === 'cashback_validade_dias')?.valor ?? '50', 10))

  return (
    <div className="min-h-screen bg-[#f8f7fb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-[#6a5a98] font-black text-lg tracking-widest" style={{ fontFamily: 'Raleway, sans-serif' }}>
            NBP PSICANÁLISE
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#6a5a98]/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#6a5a98]" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{aluno.nome.split(' ')[0]}</span>
            </div>
            <form action={async () => {
              'use server'
              const cookieStore = await cookies()
              cookieStore.delete('aluno_token')
              redirect('/minha-area/auth/login')
            }}>
              <button type="submit" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Boas-vindas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Raleway, sans-serif' }}>
            Olá, {aluno.nome.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 mt-1">Continue de onde parou ou explore novos cursos.</p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#6a5a98]/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#6a5a98]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{minhasMatriculas.length}</div>
              <div className="text-xs text-gray-400">Cursos matriculados</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {minhasMatriculas.filter(m => m.progressoPercent === 100).length}
              </div>
              <div className="text-xs text-gray-400">Concluídos</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {minhasMatriculas.filter(m => m.progressoPercent > 0 && m.progressoPercent < 100).length}
              </div>
              <div className="text-xs text-gray-400">Em andamento</div>
            </div>
          </div>
        </div>

        {/* Progresso de Formação Prática (Tripé Psicanalítico) */}
        {progressoAtivo && (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <Award className="w-5 h-5 text-[#6a5a98]" /> Formação Prática (Tripé Psicanalítico)
            </h2>
            <p className="text-gray-400 text-xs mb-6">Acompanhe suas horas práticas registradas necessárias para conclusão do curso de Formação Clínica.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Supervisao */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">Supervisão Clínica</span>
                  <span className="text-gray-500 text-xs font-medium">{supervisaoHoras}h / {supervisaoTarget}h</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-[#6a5a98] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (supervisaoHoras / supervisaoTarget) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">Orientação individual e discussão de casos clínicos</p>
              </div>

              {/* Analise */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">Análise Pessoal</span>
                  <span className="text-gray-500 text-xs font-medium">{analiseHoras}h / {analiseTarget}h</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (analiseHoras / analiseTarget) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">Sessões individuais com analista credenciado</p>
              </div>

              {/* Observacao */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">Observação Acadêmica</span>
                  <span className="text-gray-500 text-xs font-medium">{observacaoHoras}h / {observacaoTarget}h</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (observacaoHoras / observacaoTarget) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400">Estágios, observações clínicas e seminários práticos</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de cursos */}
        {minhasMatriculas.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-400 mb-2">Nenhum curso ainda</h2>
            <p className="text-gray-400 text-sm mb-6">Explore nossa grade e inicie sua jornada psicanalítica.</p>
            <Link href="/cursos"
              className="bg-[#6a5a98] text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-[#5a4a88] transition-colors">
              Ver Cursos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Meus Cursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {minhasMatriculas.map(m => (
                <Link key={m.matriculaId} href={`/minha-area/curso/${m.cursoSlug}`}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-[#6a5a98]/30 transition-all duration-200">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-100">
                    {m.cursoFoto ? (
                      <Image src={m.cursoFoto} alt={m.cursoNome} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                    {/* Badge concluído */}
                    {m.progressoPercent === 100 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" /> Concluído
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 group-hover:text-[#6a5a98] transition-colors">
                      {m.cursoNome}
                    </h3>
                    {/* Barra de progresso */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progresso</span>
                        <span className="text-xs font-semibold text-[#6a5a98]">{m.progressoPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6a5a98] to-[#9b7fc7] rounded-full transition-all duration-500"
                          style={{ width: `${m.progressoPercent}%` }}
                        />
                      </div>
                    </div>
                    {/* Certificado */}
                    {m.certificadoAt && m.certificadoOk && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600 mt-2">
                        <Award className="w-3.5 h-3.5" /> Certificado disponível
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA mais cursos */}
        <div className="mt-12 bg-gradient-to-r from-[#6a5a98] to-[#4a3a78] rounded-3xl p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Quer expandir seu conhecimento?</h3>
          <p className="text-white/80 text-sm mb-5">Explore toda a grade do NBP e aprofunde-se na psicanálise.</p>
          <Link href="/cursos"
            className="bg-white text-[#6a5a98] font-bold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-gray-50 transition-colors">
            Ver todos os cursos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  )
}
