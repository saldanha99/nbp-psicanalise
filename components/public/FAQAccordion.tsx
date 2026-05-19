'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Como funciona a Formação em Psicanálise do NBP?',
    answer:
      'Nossa formação é estruturada com base no tripé psicanalítico essencial: teoria psicanalítica detalhada, supervisão clínica com analistas experientes e análise pessoal do estudante.',
  },
  {
    question: 'Qual certificação receberei ao final do curso?',
    answer:
      'Ao concluir todas as exigências curriculares (grade teórica, horas de análise e supervisão), você receberá o certificado oficial de Formação em Psicanálise emitido pelo NBP, habilitando-o a atuar clinicamente.',
  },
  {
    question: 'Quem pode ingressar na Formação do NBP?',
    answer:
      'A formação é voltada para portadores de diploma de ensino superior em qualquer área do conhecimento que desejem atuar como psicanalistas ou que busquem um profundo autoconhecimento e fundamentação teórica.',
  },
  {
    question: 'As aulas são presenciais ou online?',
    answer:
      'Oferecemos modalidades flexíveis de ensino, com opções de aulas ao vivo online e encontros presenciais, permitindo que alunos de qualquer localidade do país realizem sua formação com excelência.',
  },
  {
    question: 'Como funciona a prática clínica supervisionada?',
    answer:
      'A partir do período determinado na formação, o aluno inicia os atendimentos clínicos de estágio, que são acompanhados e orientados por supervisores credenciados pelo NBP.',
  },
  {
    question: 'Quais são as formas de pagamento e matrícula?',
    answer:
      'As matrículas podem ser iniciadas diretamente por nosso site ou WhatsApp. Oferecemos opções facilitadas de parcelamento e planos especiais de pagamento para a sua formação.',
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => setOpenIndex((prev) => (prev === index ? null : index))

  return (
    <section className="bg-brand-bg py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-10">
        <div className="text-center flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-brand-text tracking-tight">
            PERGUNTAS <span className="text-brand-accent">FREQUENTES</span>
          </h2>
          <p className="text-brand-muted text-base">Tudo o que você precisa saber sobre a nossa formação.</p>
        </div>

        <div className="flex flex-col gap-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={cn(
                  'bg-brand-surface border rounded-xl overflow-hidden transition-colors',
                  isOpen ? 'border-brand-accent/50' : 'border-brand-border',
                )}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-brand-text font-medium text-sm sm:text-base leading-snug">
                    {faq.question}
                  </span>
                  <span className={cn('shrink-0 transition-colors', isOpen ? 'text-brand-accent' : 'text-brand-muted')}>
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-brand-muted text-sm leading-relaxed border-t border-brand-border pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
