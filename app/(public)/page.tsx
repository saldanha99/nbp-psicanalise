import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { TestimonialsCarousel } from '@/components/public/TestimonialsCarousel'
import { artigos } from '@/lib/data/artigos'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NBP Psicanálise | Formação em Psicanálise com Certificação',
  description: 'Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja tornar-se um profissional da área.',
}

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      <Header />
      
      <main>
        {/* SEÇÃO 1: HERO NÚCLEO PSICANALÍTICO */}
        <section className="w-full py-16 md:py-28">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            
            {/* Imagem Esquerda */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
              <img 
                src="https://nbpsicanalise.com.br/wp-content/uploads/2021/04/curso-formacao-min.png" 
                alt="Núcleo Brasileiro de Psicanálise" 
                className="w-full max-w-[480px] h-auto object-contain"
              />
            </div>

            {/* Texto Direita */}
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
                Núcleo psicanalítico
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[#6a5a98] leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                NÚCLEO BRASILEIRO DE PSICANÁLISE
              </h1>
              <div className="text-[15px] md:text-[16px] leading-[28px] font-light text-gray-600 mb-8">
                <p>Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja tornar-se um profissional da área, e/ou conhecer, aprofundar-se no universo psicanalítico.</p>
              </div>
              <div>
                <Link 
                  href="/sobre" 
                  className="inline-block px-8 py-3.5 border border-[#6a5a98] text-[#6a5a98] text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-[#6a5a98] hover:text-white transition-all duration-300"
                >
                  Quem Somos
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* SEÇÃO 2: DEPOIMENTOS (FULL BACKGROUND WITH PARALLAX & CAROUSEL) */}
        <section 
          className="w-full bg-fixed bg-center bg-cover"
          style={{ backgroundImage: 'url(https://nbpsicanalise.com.br/wp-content/uploads/2021/04/bg-depoimento.jpg)' }}
        >
          <TestimonialsCarousel />
        </section>

        {/* SEÇÃO 3: CONHEÇA NOSSOS CURSOS */}
        <section className="w-full py-16 md:py-28 bg-[#fcfcfc] border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
            
            {/* Imagem Esquerda */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
              <img 
                src="https://nbpsicanalise.com.br/wp-content/uploads/2021/04/cursos-min.png" 
                alt="Conheça Nossos Cursos" 
                className="w-full max-w-[480px] h-auto object-contain"
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
              <div className="text-[15px] md:text-[16px] leading-[28px] font-light text-gray-600 mb-8">
                <p>Com profissionais devidamente formados e certificados, oferecemos uma formação em Psicanálise sólida, workshops, cursos rápidos, palestras, entre outros.</p>
              </div>
              <div>
                <Link 
                  href="/cursos" 
                  className="inline-block px-8 py-3.5 border border-[#6a5a98] text-[#6a5a98] text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-[#6a5a98] hover:text-white transition-all duration-300"
                >
                  Veja nossos cursos e eventos
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* SEÇÃO 4: VEJA NOSSOS ARTIGOS RECENTES */}
        <section className="w-full py-16 md:py-28 bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            
            {/* Cabeçalho */}
            <div className="text-center mb-16">
              <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 flex items-center justify-center gap-2">
                <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
                Textos & Artigos
                <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#6a5a98] uppercase tracking-wide" style={{ fontFamily: 'Raleway, sans-serif' }}>
                VEJA NOSSOS ARTIGOS RECENTES
              </h2>
            </div>

            {/* Grid de Artigos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {artigos.map((artigo) => (
                <article key={artigo.slug} className="flex flex-col h-full bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  
                  {/* Capa do Artigo */}
                  <Link href={`/textos/${artigo.slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <img 
                      src={artigo.imagemCapa} 
                      alt={artigo.titulo}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Conteúdo do Card */}
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-[11px] text-gray-400 font-medium mb-3 block">
                      {artigo.dataPublicacao}
                    </span>
                    
                    <Link href={`/textos/${artigo.slug}`}>
                      <h3 className="text-[16px] font-bold text-[#333] hover:text-[#6a5a98] transition-colors mb-3 leading-snug uppercase line-clamp-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
                        {artigo.titulo}
                      </h3>
                    </Link>
                    
                    <p className="text-[13px] text-gray-500 line-clamp-3 leading-relaxed mb-6 font-light">
                      {artigo.resumo}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      {/* Autor */}
                      <div className="flex items-center gap-2">
                        <img 
                          src={artigo.autorFoto} 
                          alt={artigo.autorNome}
                          className="w-7 h-7 rounded-full object-cover border border-gray-100"
                        />
                        <span className="text-[11px] text-gray-600 font-medium">
                          {artigo.autorNome}
                        </span>
                      </div>
                      
                      {/* Link Ler Mais */}
                      <Link 
                        href={`/textos/${artigo.slug}`} 
                        className="text-[11px] font-bold text-[#6a5a98] hover:text-[#584885] uppercase tracking-widest transition-colors"
                      >
                        Leia Mais →
                      </Link>
                    </div>
                  </div>

                </article>
              ))}
            </div>

            {/* Botão Ver Todos os Artigos */}
            <div className="text-center">
              <Link 
                href="/textos" 
                className="inline-block px-10 py-4 bg-[#00a896] hover:bg-[#008f80] text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow"
              >
                Veja todos os artigos
              </Link>
            </div>

          </div>
        </section>

      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
