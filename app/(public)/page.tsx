import { getCursosDestaque } from '@/lib/db/queries/cursos'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'home - NBP Psicanálise | Formação em Psicanálise com Certificação',
  description: 'Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja tornar-se um profissional da área.',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const destaques = await getCursosDestaque()

  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      <Header />
      
      <main>
        {/* SEÇÃO 1: HERO NÚCLEO PSICANALÍTICO */}
        <section className="w-full py-16 md:py-32">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-12">
            
            {/* Texto Esquerda */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
                Núcleo psicanalítico
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[#6a5a98] leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                NÚCLEO BRASILEIRO DE PSICANÁLISE
              </h1>
              <div className="text-[16px] leading-[28px] font-light text-gray-700">
                <p>Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja tornar-se um profissional da área, e/ou conhecer, aprofundar-se no universo psicanalítico.</p>
              </div>
            </div>

            {/* Imagem Direita (Parallax effect in WP) */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <img 
                src="https://nbpsicanalise.com.br/wp-content/uploads/2021/04/curso-formacao-min.png" 
                alt="Núcleo Brasileiro de Psicanálise" 
                className="w-full max-w-[500px] h-auto object-contain"
              />
            </div>

          </div>
        </section>

        {/* SEÇÃO 2: DEPOIMENTOS (FULL BACKGROUND) */}
        <section 
          className="w-full h-[400px] bg-fixed bg-center bg-cover flex items-center justify-center"
          style={{ backgroundImage: 'url(https://nbpsicanalise.com.br/wp-content/uploads/2021/04/bg-depoimento.jpg)' }}
        >
          {/* No site original esta seção contém o carrossel "O QUE DIZEM SOBRE NÓS", 
              estamos mantendo o layout de fundo 100% igual ao WP. */}
          <div className="text-center text-white">
            <h2 className="text-3xl font-semibold tracking-wide uppercase shadow-sm">O Que Dizem Sobre Nós</h2>
          </div>
        </section>

        {/* SEÇÃO 3: CONHEÇA NOSSOS CURSOS */}
        <section className="w-full py-16 md:py-32">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center gap-12 mb-16">
            
            {/* Imagem Esquerda */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
              <img 
                src="https://nbpsicanalise.com.br/wp-content/uploads/2021/04/cursos-min.png" 
                alt="Conheça Nossos Cursos" 
                className="w-full max-w-[500px] h-auto object-contain"
              />
            </div>

            {/* Texto Direita */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
                Formações em Psicanálise
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#6a5a98] leading-tight mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                CONHEÇA NOSSOS CURSOS
              </h2>
              <div className="text-[16px] leading-[28px] font-light text-gray-700">
                <p>Com profissionais devidamente formados e certificados, oferecemos uma formação em Psicanálise sólida, workshops, cursos rápidos, palestras, entre outros.</p>
              </div>
            </div>

          </div>

          {/* GRID DE CURSOS EXTRAÍDOS */}
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destaques.slice(0, 6).map((curso) => (
                <div key={curso.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-black mb-4">
                    <img 
                      src={curso.fotos?.[0] || "https://nbpsicanalise.com.br/wp-content/uploads/2023/08/sobre-formacao-psicanalista.jpeg"} 
                      alt={curso.nome}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#333] mb-2 uppercase leading-snug" style={{ fontFamily: 'Raleway, sans-serif' }}>
                    {curso.nome}
                  </h3>
                  {curso.descricao && (
                    <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
                      {curso.descricao}
                    </p>
                  )}
                  <Link href={`/cursos/${curso.slug}`} className="inline-block mt-4 text-[11px] font-bold text-[#6a5a98] uppercase tracking-widest hover:text-[#584885] transition-colors">
                    Ver Curso →
                  </Link>
                </div>
              ))}
            </div>
            {destaques.length > 6 && (
              <div className="mt-12 text-center">
                <Link href="/cursos" className="inline-block px-8 py-3 border-2 border-[#6a5a98] text-[#6a5a98] text-[12px] font-bold uppercase tracking-widest hover:bg-[#6a5a98] hover:text-white transition-colors">
                  Ver Todos os Cursos
                </Link>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
