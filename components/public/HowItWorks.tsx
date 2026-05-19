import FlowArt, { FlowSection } from '@/components/ui/story-scroll'

const steps = [
  {
    num: '01',
    label: 'Explore',
    title: 'ESCOLHA\nSEU\nCURSO',
    body: 'Navegue pelo nosso catálogo com cursos de formação, especialização e aulas na área de Psicanálise. Encontre a trilha de aprendizado ideal para o seu momento.',
    bg: '#FFFFFF',
    color: '#0F172A',
    divider: 'rgba(15,23,42,0.15)',
  },
  {
    num: '02',
    label: 'Matricule-se',
    title: 'MATRÍCULA\nSIMPLES',
    body: 'Entre em contato via WhatsApp ou preencha o formulário de contato. Nossa secretaria confirmará detalhes acadêmicos e facilitará o seu ingresso imediato.',
    extra: [
      { titulo: 'Atendimento Rápido', texto: 'Secretaria acadêmica disponível para esclarecer suas dúvidas sobre a grade.' },
      { titulo: 'Matrícula Segura', texto: 'Garantia de orientação e suporte completo no início da sua jornada.' },
      { titulo: 'Acesso Rápido', texto: 'Acesso imediato à área de membros e materiais pedagógicos após confirmação.' },
    ],
    bg: '#0F172A',
    color: '#FFFFFF',
    divider: 'rgba(255,255,255,0.15)',
  },
  {
    num: '03',
    label: 'Estude',
    title: 'CONEXÃO\nE\nTEORIA',
    body: 'Aprenda com aulas teóricas bem estruturadas conduzidas por psicanalistas ativos. Explore de Freud aos contemporâneos com materiais e textos selecionados.',
    extra: [
      { titulo: 'Prática Integrada', texto: 'Estudos de caso reais discutidos diretamente nos encontros e aulas.' },
      { titulo: 'Material Exclusivo', texto: 'Acesse indicações de leitura, artigos fundamentais e gravações.' },
    ],
    bg: '#2563EB',
    color: '#FFFFFF',
    divider: 'rgba(255,255,255,0.2)',
  },
  {
    num: '04',
    label: 'Forme-se',
    title: 'CLÍNICA\nE\nCERTIFICADO',
    body: 'Complete o tripé da psicanálise por meio de supervisão clínica dedicada e análise pessoal. Ao final das exigências curriculares, receba sua certificação oficial emitida pelo NBP.',
    bg: '#F5F0E8',
    color: '#0F172A',
    divider: 'rgba(15,23,42,0.15)',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona">
      <FlowArt aria-label="Como funciona a formação na NBP Psicanálise">
        {steps.map((step, i) => (
          <FlowSection
            key={step.num}
            aria-label={`Passo ${step.num}: ${step.label}`}
            style={{ backgroundColor: step.bg, color: step.color }}
          >
            {/* Número + label */}
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ opacity: 0.6 }}
            >
              {step.num} — {step.label}
            </p>

            {/* Divisor */}
            <hr
              className="border-none border-t"
              style={{ borderTopColor: step.divider, marginTop: '2vw', marginBottom: '2vw' }}
            />

            {/* Heading grande */}
            <div>
              <h2
                className="font-[family-name:var(--font-display)] font-black leading-[0.85] uppercase tracking-tight"
                style={{ fontSize: 'clamp(3.5rem, 12vw, 11rem)' }}
              >
                {step.title.split('\n').map((line, j) => (
                  <span key={j} className="block">{line}</span>
                ))}
              </h2>
            </div>

            {/* Divisor */}
            <hr
              className="border-none border-t"
              style={{ borderTopColor: step.divider, marginTop: '2vw', marginBottom: '2vw' }}
            />

            {/* Descrição */}
            <p
              className="max-w-[50ch] font-normal leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 1.75rem)' }}
            >
              {step.body}
            </p>

            {/* Cards extras (passo 2 e 3) */}
            {step.extra && (
              <>
                <hr
                  className="border-none border-t"
                  style={{ borderTopColor: step.divider, marginTop: '2vw', marginBottom: '2vw' }}
                />
                <div className="flex flex-wrap gap-[3vw]">
                  {step.extra.map((item) => (
                    <div key={item.titulo} className="min-w-[180px] flex-1">
                      <p
                        className="mb-2 text-sm font-bold uppercase tracking-wider"
                      >
                        {item.titulo}
                      </p>
                      <p
                        className="leading-relaxed"
                        style={{ fontSize: 'clamp(0.85rem, 1.3vw, 1.05rem)', opacity: 0.7 }}
                      >
                        {item.texto}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </FlowSection>
        ))}
      </FlowArt>
    </section>
  )
}
