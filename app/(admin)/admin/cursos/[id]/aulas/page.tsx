import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { getCursoById } from '@/lib/db/queries/cursos'
import { getCursoComModulosEAulas } from '@/lib/db/queries/modulos'
import { AulasEditor } from '@/components/admin/AulasEditor'
import { BackButton } from '@/components/admin/BackButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AulasPage({ params }: PageProps) {
  const { id } = await params

  const [curso, modulos] = await Promise.all([
    getCursoById(id),
    getCursoComModulosEAulas(id),
  ])

  if (!curso) notFound()

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/admin/cursos" className="hover:text-zinc-300 transition-colors">
            Cursos
          </Link>
          <span>/</span>
          <span className="text-zinc-300 truncate max-w-[200px]">{curso.nome}</span>
          <span>/</span>
          <span className="text-orange-400 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Aulas
          </span>
        </div>

        {/* Card info do curso */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-4">
          {curso.fotoDestaque && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={curso.fotoDestaque}
              alt={curso.nome}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">{curso.nome}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
              <span className="capitalize">{curso.tipoCurso}</span>
              <span>·</span>
              <span>{curso.categoria}</span>
              {curso.cargaHoraria && (
                <>
                  <span>·</span>
                  <span>{curso.cargaHoraria}</span>
                </>
              )}
              <span>·</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  curso.ativo
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-700/50 text-zinc-500'
                }`}
              >
                {curso.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
          <Link
            href={`/admin/cursos/${id}/editar`}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors shrink-0"
          >
            Editar curso
          </Link>
        </div>

        {/* Editor de módulos e aulas */}
        <AulasEditor
          cursoId={id}
          cursoNome={curso.nome}
          modulosIniciais={modulos as Parameters<typeof AulasEditor>[0]['modulosIniciais']}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const curso = await getCursoById(id)
  return {
    title: curso ? `Aulas — ${curso.nome} | Admin NBP` : 'Aulas | Admin NBP',
  }
}
