import { getCursosAtivos } from '@/lib/db/queries/cursos'
import { CourseGrid } from '@/components/public/CourseGrid'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { CatalogHeader } from '@/components/public/CatalogHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Catálogo de Cursos — NBP Psicanálise',
  description: 'Conheça todos os nossos cursos de formação, especialização e aulas gravadas na área de Psicanálise.',
}

export const dynamic = 'force-dynamic'

export default async function CursosPage() {
  const cursos = await getCursosAtivos()

  return (
    <>
      <Header />
      <main className="flex-1 bg-brand-bg pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CatalogHeader totalCourses={cursos.length} />
          <CourseGrid cursos={cursos} />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
