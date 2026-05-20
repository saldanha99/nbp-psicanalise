'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AlunoLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/aluno/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Credenciais inválidas')
      router.push('/minha-area')
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6ff] via-white to-[#ede8ff] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-[#6a5a98] font-black text-2xl tracking-widest" style={{ fontFamily: 'Raleway, sans-serif' }}>
            NBP PSICANÁLISE
          </Link>
          <p className="text-gray-400 text-sm mt-2">Área do Aluno</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="w-14 h-14 bg-[#6a5a98]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-[#6a5a98]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 text-center mb-6">Entrar na Área do Aluno</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">E-mail</label>
              <input
                required type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Senha</label>
              <div className="relative">
                <input
                  required type={mostrarSenha ? 'text' : 'password'}
                  value={senha} onChange={e => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{erro}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#6a5a98] hover:bg-[#5a4a88] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</> : 'Entrar'}
            </button>
          </form>

          <div className="mt-5 text-center space-y-3">
            <Link href="/minha-area/recuperar-senha" className="text-sm text-[#6a5a98] hover:underline">
              Esqueci minha senha
            </Link>
            <p className="text-sm text-gray-400">
              Não tem conta?{' '}
              <Link href="/cursos" className="text-[#6a5a98] font-medium hover:underline">
                Ver nossos cursos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
