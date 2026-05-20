'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Shield, Lock, CheckCircle2, CreditCard, QrCode, FileText,
  ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle, Loader2,
  Award, Clock, Infinity, Copy, Check
} from 'lucide-react'

interface CursoCheckout {
  id: string
  nome: string
  slug: string
  foto: string | null
  descricao: string
  precoVenda: number
  precoOriginal: number | null
  cargaHoraria: string | null
  certificado: boolean
  acessoVitalicio: boolean
  diasAcesso: number | null
}

interface Props {
  curso: CursoCheckout
}

type FormaPagamento = 'pix' | 'cartao' | 'boleto'

export function CheckoutClient({ curso }: Props) {
  const router = useRouter()

  // Formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('pix')
  const [parcelas, setParcelas] = useState(1)

  // Cartão
  const [cartaoNumero, setCartaoNumero] = useState('')
  const [cartaoNome, setCartaoNome] = useState('')
  const [cartaoMes, setCartaoMes] = useState('')
  const [cartaoAno, setCartaoAno] = useState('')
  const [cartaoCvv, setCartaoCvv] = useState('')

  // Estado
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [pago, setPago] = useState(false)
  const [pixData, setPixData] = useState<{ qrCode: string; chave: string } | null>(null)
  const [pedidoId, setPedidoId] = useState('')
  const [copiado, setCopiado] = useState(false)

  const descontoPercent = curso.precoOriginal && curso.precoOriginal > curso.precoVenda
    ? Math.round((1 - curso.precoVenda / curso.precoOriginal) * 100)
    : 0

  const maxParcelas = curso.precoVenda >= 60 ? Math.min(12, Math.floor(curso.precoVenda / 20)) : 1

  function formatCpf(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14)
  }
  function formatTelefone(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15)
  }
  function formatCartao(v: string) {
    return v.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        cursoId: curso.id,
        nome, email, cpf: cpf.replace(/\D/g, ''), telefone: telefone.replace(/\D/g, ''),
        senha, formaPagamento, parcelas,
      }

      if (formaPagamento === 'cartao') {
        body.cartaoNumero = cartaoNumero.replace(/\D/g, '')
        body.cartaoNome = cartaoNome
        body.cartaoExpMes = cartaoMes
        body.cartaoExpAno = cartaoAno
        body.cartaoCvv = cartaoCvv
      }

      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao processar pagamento')

      setPedidoId(data.pedidoId)

      if (formaPagamento === 'pix' && data.pixQrCode) {
        setPixData({ qrCode: data.pixQrCode, chave: data.pixChaveCopiaECola })
        // Polling de confirmação
        pollPagamento(data.pedidoId)
      } else if (formaPagamento === 'cartao' && data.confirmado) {
        setPago(true)
        setTimeout(() => router.push('/minha-area'), 3000)
      } else if (formaPagamento === 'boleto') {
        window.open(data.boletoUrl, '_blank')
        setPago(true)
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  async function pollPagamento(id: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status/${id}`)
        const data = await res.json()
        if (data.pago || data.status === 'pago') {
          clearInterval(interval)
          setPago(true)
          setTimeout(() => router.push('/minha-area'), 3000)
        }
      } catch { /* ignora erros de rede no polling */ }
    }, 5000)

    // Para o polling após 15 minutos
    setTimeout(() => clearInterval(interval), 15 * 60 * 1000)
  }

  async function copiarChavePix() {
    if (!pixData) return
    await navigator.clipboard.writeText(pixData.chave)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  if (pago) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8f6ff] to-[#ede8ff] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Matrícula Confirmada!</h2>
          <p className="text-gray-500 mb-6">
            Você já tem acesso ao curso <strong>{curso.nome}</strong>.<br />
            Redirecionando para sua área do aluno...
          </p>
          <div className="w-8 h-8 border-4 border-[#6a5a98] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6ff] to-white">
      {/* Header minimalista */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[#6a5a98] font-bold text-lg tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>
            NBP Psicanálise
          </span>
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Lock className="w-4 h-4" />
            Compra 100% Segura
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Formulário ── */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados pessoais */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Seus dados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nome Completo *</label>
                  <input
                    required value={nome} onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">E-mail *</label>
                  <input
                    required type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">CPF</label>
                  <input
                    value={cpf} onChange={e => setCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">WhatsApp</label>
                  <input
                    value={telefone} onChange={e => setTelefone(formatTelefone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Senha para a Área do Aluno *</label>
                  <div className="relative">
                    <input
                      required type={mostrarSenha ? 'text' : 'password'}
                      value={senha} onChange={e => setSenha(e.target.value)}
                      placeholder="Crie uma senha de acesso"
                      minLength={6}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                    />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Mínimo 6 caracteres. Você usará para acessar os cursos.</p>
                </div>
              </div>
            </div>

            {/* Forma de pagamento */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Forma de pagamento</h2>

              {/* Tabs */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
                {(['pix', 'cartao', 'boleto'] as FormaPagamento[]).map(f => (
                  <button key={f} type="button"
                    onClick={() => setFormaPagamento(f)}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${formaPagamento === f ? 'bg-[#6a5a98] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                    {f === 'pix' && <QrCode className="w-4 h-4" />}
                    {f === 'cartao' && <CreditCard className="w-4 h-4" />}
                    {f === 'boleto' && <FileText className="w-4 h-4" />}
                    {f === 'pix' ? 'PIX' : f === 'cartao' ? 'Cartão' : 'Boleto'}
                  </button>
                ))}
              </div>

              {/* PIX */}
              {formaPagamento === 'pix' && !pixData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <QrCode className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">Pagamento instantâneo via PIX</p>
                  <p className="text-xs text-green-600 mt-1">QR Code gerado ao confirmar. Acesso imediato após pagamento.</p>
                </div>
              )}

              {/* PIX QR Code gerado */}
              {pixData && (
                <div className="text-center space-y-4">
                  <p className="text-sm font-medium text-gray-700">Escaneie o QR Code ou copie a chave PIX:</p>
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/png;base64,${pixData.qrCode}`} alt="QR Code PIX" className="w-48 h-48 border-4 border-[#6a5a98]/20 rounded-xl" />
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <code className="text-xs text-gray-600 flex-1 break-all text-left">{pixData.chave.slice(0, 60)}...</code>
                    <button type="button" onClick={copiarChavePix}
                      className="flex-shrink-0 bg-[#6a5a98] text-white rounded-lg p-2 hover:bg-[#5a4a88] transition-colors">
                      {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <p className="text-xs">Aguardando confirmação do pagamento...</p>
                  </div>
                </div>
              )}

              {/* Cartão */}
              {formaPagamento === 'cartao' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Número do Cartão</label>
                    <input
                      value={cartaoNumero} onChange={e => setCartaoNumero(formatCartao(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nome no Cartão</label>
                    <input
                      value={cartaoNome} onChange={e => setCartaoNome(e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mês</label>
                      <input value={cartaoMes} onChange={e => setCartaoMes(e.target.value.slice(0, 2))}
                        placeholder="MM" maxLength={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Ano</label>
                      <input value={cartaoAno} onChange={e => setCartaoAno(e.target.value.slice(0, 4))}
                        placeholder="AAAA" maxLength={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">CVV</label>
                      <input value={cartaoCvv} onChange={e => setCartaoCvv(e.target.value.slice(0, 4))}
                        placeholder="000" maxLength={4} type="password"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] focus:ring-2 focus:ring-[#6a5a98]/20 transition-all" />
                    </div>
                  </div>
                  {maxParcelas > 1 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Parcelas</label>
                      <select value={parcelas} onChange={e => setParcelas(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6a5a98] bg-white">
                        {Array.from({ length: maxParcelas }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>
                            {n}x de R$ {(curso.precoVenda / n).toFixed(2).replace('.', ',')}
                            {n === 1 ? ' (sem juros)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Boleto */}
              {formaPagamento === 'boleto' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-medium">Boleto Bancário</p>
                  <p className="text-xs text-blue-600 mt-1">O boleto será gerado ao confirmar. Prazo de compensação: até 3 dias úteis.</p>
                </div>
              )}
            </div>

            {/* Erro */}
            {erro && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{erro}</p>
              </div>
            )}

            {/* Submit */}
            {!pixData && (
              <button type="submit" disabled={loading}
                className="w-full bg-[#6a5a98] hover:bg-[#5a4a88] disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#6a5a98]/30">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
                ) : (
                  <><Shield className="w-5 h-5" /> Finalizar Matrícula — R$ {curso.precoVenda.toFixed(2).replace('.', ',')}</>
                )}
              </button>
            )}

            {/* Logos de segurança */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5" /> SSL Seguro
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Shield className="w-3.5 h-3.5" /> Asaas
              </div>
              <div className="text-xs text-gray-300">VISA · MASTER · PIX · BOLETO</div>
            </div>
          </form>

          {/* ── Resumo do curso ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Foto */}
              {curso.foto && (
                <div className="relative aspect-video bg-gray-100">
                  <Image src={curso.foto} alt={curso.nome} fill className="object-cover" />
                </div>
              )}
              <div className="p-5 space-y-4">
                <h3 className="font-bold text-gray-900 text-base leading-snug">{curso.nome}</h3>

                {/* Preço */}
                <div>
                  {curso.precoOriginal && descontoPercent > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 line-through text-sm">
                        R$ {curso.precoOriginal.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        -{descontoPercent}%
                      </span>
                    </div>
                  )}
                  <div className="text-3xl font-black text-[#6a5a98]">
                    R$ {curso.precoVenda.toFixed(2).replace('.', ',')}
                  </div>
                  {formaPagamento === 'cartao' && maxParcelas > 1 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      ou {maxParcelas}x de R$ {(curso.precoVenda / maxParcelas).toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>

                {/* Benefícios */}
                <div className="space-y-2.5 pt-2 border-t border-gray-100">
                  {curso.acessoVitalicio ? (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Infinity className="w-4 h-4 text-[#6a5a98] flex-shrink-0" />
                      Acesso Vitalício
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#6a5a98] flex-shrink-0" />
                      {curso.diasAcesso} dias de acesso
                    </div>
                  )}
                  {curso.certificado && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-[#6a5a98] flex-shrink-0" />
                      Certificado NBP
                    </div>
                  )}
                  {curso.cargaHoraria && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-[#6a5a98] flex-shrink-0" />
                      {curso.cargaHoraria} de conteúdo
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    Suporte da equipe NBP
                  </div>
                </div>
              </div>
            </div>

            {/* Badge segurança */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Compra 100% Segura</p>
                <p className="text-xs text-green-600">Pagamento processado pelo Asaas com criptografia SSL.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
