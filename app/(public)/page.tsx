import { getCursosDestaque } from '@/lib/db/queries/cursos'
import { Header } from '@/components/public/Header'
import { CourseGrid } from '@/components/public/CourseGrid'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NBP Psicanálise | Cursos e Formação',
  description: 'O Núcleo Brasileiro de Psicanálise oferece cursos, formação e eventos focados no estudo contínuo e aprofundado da Psicanálise.',
}

export const dynamic = 'force-dynamic'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'NBP Psicanálise',
  description: 'O Núcleo Brasileiro de Psicanálise oferece cursos e formação na área de Psicanálise.',
  url: 'https://nbpsicanalise.com.br',
  telephone: '+55-11-99999-9999',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Tatuapé',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    addressCountry: 'BR',
  },
}

export default async function HomePage() {
  const destaques = await getCursosDestaque()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 bg-[#f9f9f9]">
        
        {/* Hero Section Oficial NBP */}
        <section className="relative w-full bg-white overflow-hidden py-16 md:py-24 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
            
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-[#6a5a98] text-sm font-semibold uppercase tracking-widest mb-4">
                <span className="w-8 h-px bg-[#6a5a98]"></span>
                Núcleo Psicanalítico
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#6a5a98] mb-6 leading-tight font-[family-name:var(--font-display)] uppercase">
                Núcleo Brasileiro de Psicanálise
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja tornar-se um profissional da área, e/ou conhecer, aprofundar-se no universo psicanalítico.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                <Link
                  href="/cursos"
                  className="bg-[#6a5a98] hover:bg-[#584885] text-white px-8 py-4 rounded-md font-medium transition-colors w-full sm:w-auto text-center shadow-lg shadow-[#6a5a98]/20"
                >
                  Conheça a Formação
                </Link>
                <Link
                  href="/sobre"
                  className="bg-white border border-[#6a5a98] text-[#6a5a98] hover:bg-[#6a5a98]/5 px-8 py-4 rounded-md font-medium transition-colors w-full sm:w-auto text-center"
                >
                  Saiba Mais
                </Link>
              </div>
            </div>

            <div className="flex-1 relative">
              {/* Imagem oficial extraída do site WP */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
                <img 
                  src="https://nbpsicanalise.com.br/wp-content/uploads/2021/04/curso-formacao-min.png" 
                  alt="Curso de Formação NBP" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              {/* Decoração sutil de fundo */}
              <div className="absolute -z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#6a5a98]/10 to-transparent rounded-full blur-3xl"></div>
            </div>

          </div>
        </section>

        {/* Cursos em Destaque */}
        <section id="cursos" className="py-24 bg-[#f9f9f9] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-gray-200 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-[#6a5a98] text-sm font-semibold uppercase tracking-widest mb-3">
                  Formações em Psicanálise
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family-name:var(--font-display)] uppercase">
                  Conheça <span className="text-[#6a5a98]">Nossos Cursos</span>
                </h2>
              </div>
              
              <Link
                href="/cursos"
                className="hidden md:inline-flex items-center gap-2 text-[#6a5a98] hover:text-[#584885] font-semibold transition-colors group"
              >
                Ver todos os cursos
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {destaques.length === 0 ? (
              <div className="text-center text-gray-500 py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                Nenhum curso cadastrado no momento.
              </div>
            ) : (
              <CourseGrid cursos={destaques} />
            )}

            <div className="mt-10 text-center md:hidden">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#6a5a98] hover:bg-gray-50 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Ver catálogo completo
                <ArrowRight className="size-4" />
              </Link>
            </div>

          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
