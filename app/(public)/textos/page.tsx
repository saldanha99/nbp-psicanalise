import React from 'react'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { artigos } from '@/lib/data/artigos'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artigos e Textos — NBP Psicanálise',
  description: 'Fique por dentro das reflexões, entrevistas e conceitos fundamentais do mundo da Psicanálise.',
}

export const dynamic = 'force-dynamic'

export default function TextosPage() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-[#333]">
      <Header />
      
      <main className="flex-1 bg-[#f9f9f9] py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header da Página */}
          <div className="text-center mb-16">
            <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 flex items-center justify-center gap-2">
              <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
              Blog Acadêmico
              <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#6a5a98] mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Nossos Artigos e Textos
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-[15px] leading-relaxed">
              Explore conteúdos relevantes elaborados por nossos psicanalistas e docentes sobre teoria clínica, psicanálise na atualidade e artigos clássicos.
            </p>
          </div>

          {/* Grid de Artigos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artigos.map((artigo) => (
              <article key={artigo.slug} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-all duration-300">
                {/* Imagem de Capa */}
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
                    <h2 className="text-[18px] font-bold text-[#333] hover:text-[#6a5a98] transition-colors mb-3 leading-snug uppercase line-clamp-2" style={{ fontFamily: 'Raleway, sans-serif' }}>
                      {artigo.titulo}
                    </h2>
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
                        className="w-8 h-8 rounded-full object-cover border border-gray-100"
                      />
                      <span className="text-[12px] text-gray-600 font-medium">
                        {artigo.autorNome}
                      </span>
                    </div>

                    {/* Botão Leia Mais */}
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

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
