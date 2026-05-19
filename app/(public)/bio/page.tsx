import { getCursosDestaque } from '@/lib/db/queries/cursos'
import Image from 'next/image'
import { whatsappLink, WHATSAPP_NUMBER } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NBP Psicanálise — Link na Bio',
  description: 'Formação em Psicanálise Clínica e Cursos de Especialização com certificação. Acesse e fale conosco!',
}

export const dynamic = 'force-dynamic'

const links = [
  { label: '📦 Ver Catálogo de Cursos',        href: '/cursos' },
  { label: '💬 Falar no WhatsApp',             href: `https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Gostaria de mais informações sobre os cursos de Formação em Psicanálise.` },
  { label: '⭐ Formação de Psicanalistas Clínicos', href: '/cursos' },
  { label: '🎓 Cursos Livres e Especializações', href: '/cursos' },
  { label: '📍 Nossa Localização',             href: 'https://maps.google.com/?q=R.+Prof.+Roberval+Fróes,+390,+São+José+dos+Campos', external: true },
]

export default async function BioPage() {
  const destaques = await getCursosDestaque()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-[#6a5a98] rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-[#6a5a98]/30">
          <span className="font-[family-name:var(--font-display)] text-white text-2xl font-bold">NBP</span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-black text-white tracking-tight uppercase">
          NBP <span className="text-[#9d8ccf]">PSICANÁLISE</span>
        </h1>
        <p className="text-gray-300 text-sm mt-1">Formação em Psicanálise com Certificação</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[1,2,3,4,5].map(i => (
            <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
          <span className="text-gray-400 text-xs ml-1">Formação de Qualidade</span>
        </div>
      </div>

      {/* Links */}
      <div className="w-full max-w-sm space-y-3 mb-10">
        {links.map(({ label, href, external }) => (
          <a
            key={label}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="flex items-center justify-center w-full bg-white/5 border border-white/10 hover:border-[#6a5a98] hover:bg-[#6a5a98]/10 text-white font-semibold py-4 px-6 rounded-xl transition-all text-center text-sm"
          >
            {label}
          </a>
        ))}
      </div>

      {/* Destaques */}
      {destaques.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-gray-400 text-xs uppercase tracking-wide text-center mb-4">Cursos em Destaque</p>
          <div className="grid grid-cols-3 gap-2">
            {destaques.slice(0, 6).map(b => (
              <a key={b.id} href={`/cursos/${b.slug}`} className="block">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#6a5a98] transition-colors">
                  {b.fotoDestaque ? (
                    <Image src={b.fotoDestaque} alt={b.nome} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs p-2 text-center">
                      {b.nome}
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-[10px] text-center mt-1 truncate">{b.nome}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Footer bio */}
      <div className="mt-10 text-center">
        <p className="text-gray-400 text-xs">
          📱 (12) 99649-8725 · São José dos Campos / SP
        </p>
        <p className="text-gray-500 text-[10px] mt-1">© 2025 NBP Psicanálise</p>
      </div>
    </div>
  )
}
