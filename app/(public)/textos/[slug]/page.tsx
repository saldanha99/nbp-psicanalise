import React from 'react'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { artigos } from '@/lib/data/artigos'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return artigos.map((a) => ({
    slug: a.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const artigo = artigos.find((a) => a.slug === slug)
  
  if (!artigo) {
    return {
      title: 'Artigo não encontrado — NBP Psicanálise',
    }
  }

  return {
    title: `${artigo.titulo} — NBP Psicanálise`,
    description: artigo.resumo,
  }
}

export default async function ArtigoDetailPage({ params }: PageProps) {
  const { slug } = await params
  const artigo = artigos.find((a) => a.slug === slug)

  if (!artigo) {
    notFound()
  }

  // Filtrar outros artigos para sugestões
  const sugestoes = artigos.filter((a) => a.slug !== slug).slice(0, 2)

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-[#333]">
      <Header />

      <main className="flex-1 bg-white py-12">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          
          {/* Breadcrumbs */}
          <nav className="text-[12px] text-gray-400 mb-8 uppercase tracking-widest font-medium">
            <Link href="/" className="hover:text-[#6a5a98] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/textos" className="hover:text-[#6a5a98] transition-colors">Textos</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-500 font-semibold">{artigo.autorNome}</span>
          </nav>

          {/* Cabeçalho do Artigo */}
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#6a5a98] leading-tight mb-6 uppercase" style={{ fontFamily: 'Raleway, sans-serif' }}>
              {artigo.titulo}
            </h1>
            {artigo.subtitulo && (
              <p className="text-[18px] text-gray-500 font-light leading-relaxed mb-6">
                {artigo.subtitulo}
              </p>
            )}

            {/* Autor e Data */}
            <div className="flex items-center gap-3 border-y border-gray-100 py-4">
              <img 
                src={artigo.autorFoto} 
                alt={artigo.autorNome}
                className="w-12 h-12 rounded-full object-cover border border-gray-100"
              />
              <div>
                <span className="text-[14px] text-gray-700 font-bold block">
                  {artigo.autorNome}
                </span>
                <span className="text-[12px] text-gray-400 font-light block">
                  Publicado em {artigo.dataPublicacao}
                </span>
              </div>
            </div>
          </header>

          {/* Imagem de Capa */}
          <div className="w-full aspect-[16/9] rounded-lg overflow-hidden bg-gray-50 mb-12 shadow-sm">
            <img 
              src={artigo.imagemCapa} 
              alt={artigo.titulo}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Conteúdo do Artigo */}
          <article 
            className="prose max-w-none text-[#444] text-[16px] md:text-[17px] leading-[30px] font-light space-y-6 rich-content"
            dangerouslySetInnerHTML={{ __html: artigo.conteudoCompleto }}
          />

          {/* Seção de Sugestões de Leitura */}
          <div className="border-t border-gray-100 mt-16 pt-12">
            <h3 className="text-[18px] font-bold text-[#333] mb-8 uppercase tracking-wider" style={{ fontFamily: 'Raleway, sans-serif' }}>
              Continue Lendo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sugestoes.map((sugestao) => (
                <Link key={sugestao.slug} href={`/textos/${sugestao.slug}`} className="group flex gap-4">
                  <div className="w-24 h-24 shrink-0 rounded overflow-hidden bg-gray-50">
                    <img 
                      src={sugestao.imagemCapa} 
                      alt={sugestao.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-800 group-hover:text-[#6a5a98] transition-colors leading-snug line-clamp-2 uppercase">
                      {sugestao.titulo}
                    </h4>
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {sugestao.dataPublicacao}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
