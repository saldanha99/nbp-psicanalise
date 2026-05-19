import { getCursoBySlug } from '@/lib/db/queries/cursos'
import { notFound } from 'next/navigation'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { CursoDetail } from '@/components/public/CursoDetail'
import type { Metadata } from 'next'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const b = await getCursoBySlug(slug)
  if (!b) return {}
  return {
    title: `Aluguel de ${b.nome} em SJC`,
    description: `Alugue o ${b.nome} para o seu evento em São José dos Campos. ${b.faixaEtaria} · ${b.capacidade} · ${b.dimensoes}. Reserve agora via WhatsApp!`,
  }
}

export default async function CursoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const curso = await getCursoBySlug(slug)
  if (!curso) notFound()

  return (
    <>
      <Header />
      <main className="flex-1 bg-brand-bg py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CursoDetail curso={curso} />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
