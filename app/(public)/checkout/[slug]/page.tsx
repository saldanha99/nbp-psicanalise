import { db } from '@/lib/db'
import { cursos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CheckoutClient } from './CheckoutClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [curso] = await db.select().from(cursos).where(eq(cursos.slug, slug))
  return {
    title: `Checkout — ${curso?.nome ?? 'Curso'} | NBP Psicanálise`,
    robots: { index: false },
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { slug } = await params
  const [curso] = await db
    .select()
    .from(cursos)
    .where(eq(cursos.slug, slug))

  if (!curso || !curso.ativo) notFound()

  const precoVenda = parseFloat(curso.precoVenda ?? curso.precoReferencia ?? '0')
  if (precoVenda <= 0) notFound()

  return (
    <CheckoutClient
      curso={{
        id: curso.id,
        nome: curso.nome,
        slug: curso.slug,
        foto: curso.fotoDestaque ?? curso.fotos?.[0] ?? null,
        descricao: curso.descricao ?? '',
        precoVenda,
        precoOriginal: parseFloat(curso.precoOriginal ?? '0') || null,
        cargaHoraria: curso.cargaHoraria ?? null,
        certificado: curso.certificado,
        acessoVitalicio: curso.acessoVitalicio,
        diasAcesso: curso.diasAcesso ?? null,
      }}
    />
  )
}
