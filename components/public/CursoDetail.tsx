'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, BookOpen, User, Clock, Award, CheckCircle, Share2, MessageCircle, FileText, Loader2 } from 'lucide-react'
import { whatsappLink, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Curso } from '@/types'

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

export function CursoDetail({ curso }: { curso: Curso }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const isAulasGravadas = curso.categoria.toLowerCase().includes('gravada') || curso.nome.toLowerCase().includes('aulas gravadas')
  const options = isAulasGravadas
    ? Array.from({ length: 18 }, (_, i) => `Aula ${18 - i} Gravada`)
    : []

  const [selectedOption, setSelectedOption] = useState(() => {
    return isAulasGravadas ? 'Aula 18 Gravada' : ''
  })

  const fotos = curso.fotos?.length
    ? curso.fotos
    : curso.fotoDestaque
    ? [curso.fotoDestaque]
    : []

  const shareText = `Confira o curso ${curso.nome} no NBP Psicanálise!`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const salePrice = curso.precoVenda ? parseFloat(curso.precoVenda) : 0
  const originalPrice = curso.precoOriginal ? parseFloat(curso.precoOriginal) : 0
  const fallbackPrice = curso.precoReferencia ? parseFloat(curso.precoReferencia) : 0

  const handlePhoneChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    } else if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }
    setFormData(f => ({ ...f, telefone: formatted }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.nome.trim() || formData.nome.length < 2) {
      e.nome = 'Nome deve ter ao menos 2 caracteres'
    }
    const digits = formData.telefone.replace(/\D/g, '')
    if (digits.length < 10) {
      e.telefone = 'Telefone/WhatsApp inválido (mínimo 10 dígitos)'
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'E-mail inválido'
    }
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)

    const targetWhatsapp = '5511961695163'
    const textMessage = `Olá Aurélio! Tenho interesse em me matricular no curso *${curso.nome}*${selectedOption ? ` (${selectedOption})` : ''}.

*Meus dados:*
- *Nome:* ${formData.nome}
- *WhatsApp:* ${formData.telefone}
${formData.email.trim() ? `- *E-mail:* ${formData.email}` : ''}`

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email.trim() || undefined,
          cursosInteresse: [curso.nome],
          mensagem: selectedOption ? `Interesse no curso: ${curso.nome} (${selectedOption})` : `Interesse no curso: ${curso.nome}`,
          origem: 'detalhes_curso',
        }),
      })

      if (!res.ok) throw new Error('Erro ao enviar')

      toast.success('Inscrição registrada! Redirecionando para o WhatsApp...')
      setIsModalOpen(false)
      setFormData({ nome: '', telefone: '', email: '' })

      setTimeout(() => {
        window.open(whatsappLink(targetWhatsapp, textMessage), '_blank')
      }, 1000)
    } catch (error) {
      console.error('[Lead submit error]', error)
      toast.error('Registrando contato direto no WhatsApp...')
      setIsModalOpen(false)
      setTimeout(() => {
        window.open(whatsappLink(targetWhatsapp, textMessage), '_blank')
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header Banner */}
      <div className="bg-[#5B1A82]/5 border border-[#5B1A82]/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:text-[#5B1A82] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cursos" className="hover:text-[#5B1A82] transition-colors">Cursos</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium capitalize">{curso.categoria}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-[#5B1A82] text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
            {curso.categoria}
          </span>
          {curso.destaque && (
            <span className="bg-amber-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              ⭐ Destaque
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
          {curso.nome}
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Sub-navigation Menu */}
          <div className="sticky top-20 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 flex gap-6 text-sm font-medium text-gray-500">
            <a href="#sobre" className="text-[#5B1A82] border-b-2 border-[#5B1A82] pb-3 -mb-[14px]">Mais Informações</a>
            <a href="#para-quem" className="hover:text-gray-900 transition-colors pb-3">Para Quem</a>
            <a href="#docente" className="hover:text-gray-900 transition-colors pb-3">Docente</a>
          </div>

          {/* Event Details Box */}
          {(curso.tipoCurso === 'presencial' || curso.tipoCurso === 'aovivo') && (
            <div className="bg-[#5B1A82]/5 border border-[#5B1A82]/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="bg-[#5B1A82] text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider block w-max mb-1.5">
                  {curso.tipoCurso === 'presencial' ? '📍 Presencial' : '🎥 Ao Vivo / Online'}
                </span>
                <h4 className="text-base font-bold text-gray-900">Informações da Próxima Turma</h4>
                <p className="text-xs text-gray-500 mt-0.5">Confira o cronograma definido para as aulas.</p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs w-full sm:w-auto">
                {curso.dataEvento && (
                  <div className="bg-white border border-[#5B1A82]/10 rounded-xl px-4 py-2 flex flex-col min-w-[80px]">
                    <span className="text-[10px] text-gray-400 font-medium">Data</span>
                    <span className="font-bold text-gray-800">{formatDate(curso.dataEvento)}</span>
                  </div>
                )}
                {curso.horarioEvento && (
                  <div className="bg-white border border-[#5B1A82]/10 rounded-xl px-4 py-2 flex flex-col min-w-[80px]">
                    <span className="text-[10px] text-gray-400 font-medium">Horário</span>
                    <span className="font-bold text-gray-800">{curso.horarioEvento}</span>
                  </div>
                )}
                {curso.localEvento && (
                  <div className="bg-white border border-[#5B1A82]/10 rounded-xl px-4 py-2 flex flex-col min-w-[120px]">
                    <span className="text-[10px] text-gray-400 font-medium">Local</span>
                    <span className="font-bold text-gray-800 truncate max-w-[150px]" title={curso.localEvento}>{curso.localEvento}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Sobre */}
          <section id="sobre" className="scroll-mt-32 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="size-5 text-[#5B1A82]" />
              Mais Informações
            </h3>
            <div 
              className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm rich-content"
              dangerouslySetInnerHTML={{ __html: curso.descricao || "Nenhuma descrição detalhada disponível para este curso no momento." }}
            />
          </section>

          {/* Section: Para Quem */}
          <section id="para-quem" className="scroll-mt-32 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="size-5 text-[#5B1A82]" />
              Para Quem é Este Curso
            </h3>
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              {curso.publicoAlvo ? (
                <div 
                  className="rich-content text-sm" 
                  dangerouslySetInnerHTML={{ __html: curso.publicoAlvo }} 
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  Este curso é aberto a todos os adultos interessados em explorar as complexidades da psique humana através da lente da psicanálise. 
                  Ideal para psicólogos, terapeutas, estudantes, profissionais de saúde e qualquer pessoa interessada em iniciar ou aprofundar sua formação clínica.
                </p>
              )}
            </div>
          </section>

          {/* Section: Docente */}
          <section id="docente" className="scroll-mt-32 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="size-5 text-[#5B1A82]" />
              Docente Responsável
            </h3>
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative size-24 md:size-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-200">
                  <img 
                    src={curso.docenteFoto || "https://cursos.nbpsicanalise.com.br/Digitalizacao/Produto/Imagem/47/47_ORG.jpg"} 
                    alt={curso.docenteNome || "Aurélio Gonzales"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{curso.docenteNome || "Aurélio Gonzales"}</h4>
                    <p className="text-xs font-semibold text-[#5B1A82] uppercase tracking-wider">
                      {curso.docenteCargo || "Psicanalista, Professor, Supervisor Clínico e Diretor do NBP"}
                    </p>
                  </div>
                  {curso.docenteDesc ? (
                    <div 
                      className="rich-content text-xs text-gray-600" 
                      dangerouslySetInnerHTML={{ __html: curso.docenteDesc }} 
                    />
                  ) : (
                    <p className="text-gray-600 text-xs leading-relaxed">
                      Aurélio Gonzales, psicanalista com mais de 12 anos de experiência clínica e didática na psicanálise, 
                      traz seu conhecimento profund e atualizado para guiar os alunos nas vivências práticas e estudos teóricos do Núcleo Brasileiro de Psicanálise.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column (Floating Sticky Card) */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white border border-gray-150 rounded-2xl shadow-md overflow-hidden">
            {/* Imagem Principal */}
            <div 
              className="relative aspect-video bg-gray-100 cursor-zoom-in"
              onClick={() => fotos.length > 0 && setLightbox(true)}
            >
              {fotos[activePhoto] ? (
                <img 
                  src={fotos[activePhoto]} 
                  alt={curso.nome} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Sem imagem disponível
                </div>
              )}
            </div>

            {/* Preço e Botão */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                {salePrice > 0 ? (
                  <div>
                    <span className="text-xs text-gray-500 block">Investimento</span>
                    {originalPrice > salePrice && (
                      <span className="text-xs text-gray-400 line-through block">
                        De R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#5B1A82]">
                        R$ {salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gray-500">à vista</span>
                    </div>
                  </div>
                ) : fallbackPrice > 0 ? (
                  <div>
                    <span className="text-xs text-gray-500 block">Investimento</span>
                    <span className="text-3xl font-black text-[#5B1A82]">
                      R$ {fallbackPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">à vista</span>
                  </div>
                ) : isAulasGravadas ? (
                  <div>
                    <span className="text-xs text-gray-500 block">Preço do Curso</span>
                    <span className="text-3xl font-black text-gray-900">
                      R$ 25,00
                    </span>
                    <span className="text-xs text-gray-500 ml-1">cada aula</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-gray-500 block">Investimento</span>
                    <span className="text-2xl font-extrabold text-[#5B1A82]">Sob Consulta</span>
                  </div>
                )}
              </div>

              {/* Opções de compra (aulas gravadas) */}
              {isAulasGravadas && (
                <div className="space-y-2">
                  <label htmlFor="lesson-select" className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">
                    Selecione a Aula:
                  </label>
                  <select
                    id="lesson-select"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="w-full border border-gray-250 rounded-xl px-3 py-3 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B1A82]/50 bg-white font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botão de Matrícula */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full bg-[#5B1A82] hover:bg-[#481469] text-white font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#5B1A82]/20"
              >
                <MessageCircle className="size-5 fill-current" />
                Matricule-se no Curso
              </button>

              {/* Atributos */}
              <div className="border-t border-gray-100 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <Clock className="size-4 text-[#5B1A82]" />
                  <span>
                    {curso.acessoVitalicio 
                      ? 'Acesso vitalício ao conteúdo do curso' 
                      : curso.diasAcesso 
                        ? `Acesso imediato por ${curso.diasAcesso} dias após inscrição` 
                        : 'Acesso imediato de 365 dias após inscrição'}
                  </span>
                </div>
                {curso.certificado && (
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Award className="size-4 text-[#5B1A82]" />
                    <span>
                      Certificado oficial incluso {curso.cargaHoraria ? `(${curso.cargaHoraria})` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <FileText className="size-4 text-[#5B1A82]" />
                  <span>Material de leitura complementar incluso</span>
                </div>
              </div>

              {/* Compartilhar */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Compartilhar:</span>
                <div className="flex gap-2">
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <MessageCircle className="size-4" />
                  </a>
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox */}
      {lightbox && fotos.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            onClick={() => setLightbox(false)}
          >
            <X className="size-8" />
          </button>
          <div className="relative max-w-4xl max-h-[90dvh] w-full h-full">
            <Image
              src={fotos[activePhoto]}
              alt={curso.nome}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {fotos.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActivePhoto(i) }}
                  className={cn('w-2 h-2 rounded-full transition-all', i === activePhoto ? 'bg-white scale-125' : 'bg-white/40')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Lead Capture Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => !loading && setIsModalOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-white border border-gray-150 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-10 p-6 md:p-8 space-y-6 animate-scale-up">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
            >
              <X className="size-6" />
            </button>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Fale Conosco</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Preencha com seus dados para iniciar seu atendimento personalizado com o Aurélio no WhatsApp.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Seu nome completo"
                  className={cn(
                    "w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B1A82]/30 transition-all",
                    errors.nome ? "border-red-500" : "border-gray-200"
                  )}
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  WhatsApp / Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={cn(
                    "w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B1A82]/30 transition-all",
                    errors.telefone ? "border-red-500" : "border-gray-200"
                  )}
                />
                {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
              </div>

              {/* E-mail */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  E-mail <span className="text-gray-400">(Opcional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  className={cn(
                    "w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B1A82]/30 transition-all",
                    errors.email ? "border-red-500" : "border-gray-200"
                  )}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-[#5B1A82] hover:bg-[#481469] disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-[#5B1A82]/20 mt-6"
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <MessageCircle className="size-5 fill-current" />
                )}
                {loading ? "Salvando..." : "Prosseguir para o WhatsApp"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
