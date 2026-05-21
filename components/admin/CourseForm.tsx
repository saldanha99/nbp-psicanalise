'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { slugify, CATEGORIAS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ImageUpload } from './ImageUpload'
import { SingleImageUpload } from './SingleImageUpload'
import type { Curso } from '@/types'

interface Props {
  curso?: Curso
  onSuccess?: () => void
}

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().min(2, 'Slug obrigatório'),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  descricao: z.string().optional(),
  precoReferencia: z.string().optional(),
  precoVenda: z.string().optional(),
  precoOriginal: z.string().optional(),
  tipoCurso: z.string().optional(),
  cargaHoraria: z.string().optional(),
  certificado: z.boolean(),
  acessoVitalicio: z.boolean(),
  diasAcesso: z.string().optional(),
  vagasTotal: z.string().optional(),
  dataEvento: z.string().optional(),
  horarioEvento: z.string().optional(),
  localEvento: z.string().optional(),
  ativo: z.boolean(),
  destaque: z.boolean(),
  fotos: z.array(z.string()),
  fotoDestaque: z.string().nullable(),
  docenteNome: z.string().optional(),
  docenteCargo: z.string().optional(),
  docenteFoto: z.string().optional(),
  docenteDesc: z.string().optional(),
  publicoAlvo: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORIAS_FORM = CATEGORIAS.filter((c) => c.value !== 'todos')

export function CourseForm({ curso, onSuccess }: Props) {
  const isEditing = !!curso

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: curso?.nome ?? '',
      slug: curso?.slug ?? '',
      categoria: curso?.categoria ?? '',
      descricao: curso?.descricao ?? '',
      precoReferencia: curso?.precoReferencia ?? '',
      precoVenda: (curso as any)?.precoVenda ?? '',
      precoOriginal: (curso as any)?.precoOriginal ?? '',
      tipoCurso: (curso as any)?.tipoCurso ?? 'gravado',
      cargaHoraria: (curso as any)?.cargaHoraria ?? '',
      certificado: (curso as any)?.certificado ?? true,
      acessoVitalicio: (curso as any)?.acessoVitalicio ?? true,
      diasAcesso: (curso as any)?.diasAcesso?.toString() ?? '',
      vagasTotal: (curso as any)?.vagasTotal?.toString() ?? '',
      dataEvento: (curso as any)?.dataEvento ?? '',
      horarioEvento: (curso as any)?.horarioEvento ?? '',
      localEvento: (curso as any)?.localEvento ?? '',
      ativo: curso?.ativo ?? true,
      destaque: curso?.destaque ?? false,
      fotos: curso?.fotos ?? [],
      fotoDestaque: curso?.fotoDestaque ?? null,
      docenteNome: (curso as any)?.docenteNome ?? '',
      docenteCargo: (curso as any)?.docenteCargo ?? '',
      docenteFoto: (curso as any)?.docenteFoto ?? '',
      docenteDesc: (curso as any)?.docenteDesc ?? '',
      publicoAlvo: (curso as any)?.publicoAlvo ?? '',
    },
  })

  // Auto-generate slug from nome
  const nomeValue = watch('nome')
  useEffect(() => {
    if (!isEditing) {
      setValue('slug', slugify(nomeValue), { shouldValidate: false })
    }
  }, [nomeValue, isEditing, setValue])

  const onSubmit = async (data: FormData) => {
    const url = isEditing
      ? `/api/admin/cursos/${curso.id}`
      : '/api/admin/cursos'
    const method = isEditing ? 'PATCH' : 'POST'

    // Limpa campos opcionais para evitar erro no banco
    const payload = {
      ...data,
      descricao: data.descricao?.trim() || null,
      precoReferencia: data.precoReferencia?.trim() || null,
      precoVenda: data.precoVenda?.trim() || null,
      precoOriginal: data.precoOriginal?.trim() || null,
      cargaHoraria: data.cargaHoraria?.trim() || null,
      dataEvento: data.dataEvento?.trim() || null,
      horarioEvento: data.horarioEvento?.trim() || null,
      localEvento: data.localEvento?.trim() || null,
      vagasTotal: data.vagasTotal?.trim() ? parseInt(data.vagasTotal.trim()) : null,
      diasAcesso: data.diasAcesso?.trim() ? parseInt(data.diasAcesso.trim()) : null,
      docenteNome: data.docenteNome?.trim() || null,
      docenteCargo: data.docenteCargo?.trim() || null,
      docenteFoto: data.docenteFoto?.trim() || null,
      docenteDesc: data.docenteDesc?.trim() || null,
      publicoAlvo: data.publicoAlvo?.trim() || null,
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? 'Erro ao salvar')
      }

      toast.success(isEditing ? 'Curso atualizado!' : 'Curso criado!')
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar curso')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Nome + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Nome *</label>
          <input
            {...register('nome')}
            placeholder="Pula-Pula Profissional"
            className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500"
          />
          {errors.nome && <p className="text-xs text-red-400">{errors.nome.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Slug *</label>
          <input
            {...register('slug')}
            placeholder="pula-pula-profissional"
            className="rounded-lg border px-3 py-2 text-sm text-zinc-400 bg-zinc-900/50 border-zinc-700 focus:outline-none focus:border-orange-500"
          />
          {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
        </div>
      </div>

      {/* Categoria + Preço de Referência */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Categoria *</label>
          <select
            {...register('categoria')}
            className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500"
          >
            <option value="">Selecione...</option>
            {CATEGORIAS_FORM.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.categoria && <p className="text-xs text-red-400">{errors.categoria.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Preço de Referência</label>
          <input
            {...register('precoReferencia')}
            placeholder="350.00"
            type="number"
            step="0.01"
            className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Descrição</label>
        <textarea
          {...register('descricao')}
          rows={4}
          placeholder="Descreva o curso, suas características e diferenciais..."
          className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500 resize-none"
        />
      </div>

      {/* Separador LMS */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Configurações LMS / Checkout</p>

        {/* Preços de venda */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Preço de Venda (R$)</label>
            <input {...register('precoVenda')} type="number" step="0.01" placeholder="180.00"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Preço Original / Riscado (R$)</label>
            <input {...register('precoOriginal')} type="number" step="0.01" placeholder="250.00"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
        </div>

        {/* Tipo do curso + carga horária */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Tipo do Curso</label>
            <select {...register('tipoCurso')}
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500">
              <option value="gravado">Gravado (EAD)</option>
              <option value="presencial">Presencial</option>
              <option value="aovivo">Ao Vivo (Online)</option>
              <option value="formacao">Formação Completa</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Carga Horária</label>
            <input {...register('cargaHoraria')} placeholder="Ex: 40h" 
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
        </div>

        {/* Acesso e vagas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Vagas Totais (0 = ilimitado)</label>
            <input {...register('vagasTotal')} type="number" placeholder="0"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Dias de Acesso (0 = vitalício)</label>
            <input {...register('diasAcesso')} type="number" placeholder="0"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
        </div>

        {/* Evento presencial */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Data do Evento</label>
            <input {...register('dataEvento')} type="date"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Horário</label>
            <input {...register('horarioEvento')} placeholder="9h às 18h"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Local</label>
            <input {...register('localEvento')} placeholder="Tatuapé, SP"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
        </div>

        {/* Checkboxes LMS */}
        <div className="flex gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('certificado')} type="checkbox" className="w-4 h-4 rounded accent-orange-500" />
            <span className="text-sm text-zinc-300">Gera certificado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('acessoVitalicio')} type="checkbox" className="w-4 h-4 rounded accent-orange-500" />
            <span className="text-sm text-zinc-300">Acesso vitalício</span>
          </label>
        </div>
      </div>

      {/* Docente Info */}
      <div className="border-t border-zinc-800 pt-4 flex flex-col gap-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Informações do Docente</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Nome do Docente</label>
            <input {...register('docenteNome')} placeholder="Ex: Aurélio Gonzales"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-300">Cargo do Docente</label>
            <input {...register('docenteCargo')} placeholder="Ex: Psicanalista, Diretor do NBP"
              className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Descrição do Docente</label>
          <textarea {...register('docenteDesc')} rows={3} placeholder="Breve biografia ou currículo do docente..."
            className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500 resize-none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">Foto do Docente</label>
          <Controller
            name="docenteFoto"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SingleImageUpload
                value={value || ''}
                onChange={onChange}
                onRemove={() => onChange('')}
                label="Clique ou arraste a foto do docente aqui"
              />
            )}
          />
        </div>
      </div>

      {/* Público Alvo */}
      <div className="border-t border-zinc-800 pt-4 flex flex-col gap-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Público Alvo</p>
        <div className="flex flex-col gap-1.5">
          <textarea {...register('publicoAlvo')} rows={3} placeholder="Descreva o público alvo deste curso..."
            className="rounded-lg border px-3 py-2 text-sm text-white bg-zinc-900 border-zinc-700 focus:outline-none focus:border-orange-500 resize-none" />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register('ativo')}
            type="checkbox"
            className="w-4 h-4 rounded accent-orange-500"
          />
          <span className="text-sm text-zinc-300">Ativo (visível no site)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            {...register('destaque')}
            type="checkbox"
            className="w-4 h-4 rounded accent-orange-500"
          />
          <span className="text-sm text-zinc-300">Em destaque</span>
        </label>
      </div>

      {/* Image Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Fotos</label>
        <Controller
          name="fotos"
          control={control}
          render={({ field: { value } }) => (
            <ImageUpload
              fotos={value}
              fotoDestaque={watch('fotoDestaque')}
              onChange={(newFotos, newDestaque) => {
                setValue('fotos', newFotos)
                setValue('fotoDestaque', newDestaque)
              }}
            />
          )}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 text-white font-semibold"
          style={{ backgroundColor: '#F97316' }}
        >
          {isSubmitting
            ? 'Salvando...'
            : isEditing
              ? 'Salvar alterações'
              : 'Criar curso'}
        </Button>
      </div>
    </form>
  )
}
