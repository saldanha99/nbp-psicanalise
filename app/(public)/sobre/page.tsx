import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quem Somos — NBP Psicanálise',
  description: 'Somos um núcleo de psicanálise desde 2017, com sede em São Paulo (Tatuapé). Oferecemos cursos de formação, especialização e clínica social acessível.',
};

export default function SobrePage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen text-[#333] flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Section 1: Quem Somos & Imagem */}
        <section className="py-16 md:py-24 bg-white border-b border-gray-100 px-4">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-3 inline-flex items-center gap-2">
                <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
                – Núcleo psicanalítico
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-[#6a5a98] leading-tight mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                QUEM SOMOS
              </h1>
              <div className="text-[15px] md:text-[16px] leading-[28px] text-gray-600 font-light space-y-6">
                <p>
                  Somos um núcleo de psicanálise desde 2017, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja se tornar um psicanalista, ou conhecer e se aprofundar no universo psicanalítico.
                </p>
                <p>
                  Com psicanalistas, professores e supervisores comprometidos com o saber psicanalítico, o NBP também oferece cursos de extensão e especialização.
                </p>
                <p>
                  Entendendo que a Psicanálise é social (que está para a sociedade como um todo), temos nossa Clínica Acessível, que nossos alunos, em estágio supervisionado, atendem sob supervisão dos psicanalistas especializados.
                </p>
              </div>
            </div>
            {/* Imagem Ilustrativa */}
            <div className="flex justify-center">
              <div className="relative max-w-[500px] w-full aspect-square overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                <img
                  src="https://nbpsicanalise.com.br/wp-content/uploads/2021/04/quem-somos-min.png"
                  alt="Ilustração Quem Somos NBP"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Visão & Missão / Valores */}
        <section className="py-16 md:py-24 px-4 bg-[#f9f9f9]">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Visão (3/4 col) */}
            <div className="md:col-span-3 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex gap-6">
              <div className="text-[#6a5a98] flex-shrink-0 mt-1">
                {/* Target/Bullseye Icon SVG */}
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Visão
                </h3>
                <div className="text-[15px] leading-[26px] text-gray-600 font-light space-y-3">
                  <p>Fazer da Psicanálise cada vez mais conhecida e acessível a todas as pessoas, mantendo sua essência e credibilidade.</p>
                  <p>Formar psicanalistas oferecendo o melhor de nosso método, estrutura e profissionais.</p>
                  <p>Psicanalisar o maior número de pessoas com o propósito de investir na saúde mental e emocional de toda a sociedade.</p>
                </div>
              </div>
            </div>

            {/* Missão / Valores (1/4 col) */}
            <div className="md:col-span-1 bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex gap-6 md:flex-col md:gap-4">
              <div className="text-[#6a5a98] flex-shrink-0 mt-1">
                {/* Flag Icon SVG */}
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                  <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 md:mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Missão / Valores
                </h3>
                <p className="text-[15px] leading-[26px] text-gray-600 font-light">
                  Formar, ensinar, cuidar e atender com excelência.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Registros & Certificações */}
        <section className="bg-[#615892] text-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Registro RDA */}
            <div className="flex flex-col justify-center">
              <span className="text-[12px] uppercase text-white/60 tracking-widest font-semibold mb-3">
                – Importante!
              </span>
              <h4 className="text-xl md:text-2xl font-bold mb-4 leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Registro Biblioteca Nacional – RDA
              </h4>
              <p className="text-[15px] md:text-[16px] leading-[28px] text-white/80 font-light">
                Nosso Curso de Psicanálise é devidamente registrado na Biblioteca Nacional – RDA com o Registro 01475BN.
              </p>
            </div>

            {/* Registro ABRATH */}
            <div className="flex flex-col justify-center border-t border-white/10 pt-8 md:pt-0 md:border-t-0 md:border-l md:pl-16">
              <span className="text-[12px] uppercase text-white/60 tracking-widest font-semibold mb-3">
                – Importante!
              </span>
              <h4 className="text-xl md:text-2xl font-bold mb-4 leading-relaxed" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Registro ABRATH Oficial
              </h4>
              <p className="text-[15px] md:text-[16px] leading-[28px] text-white/80 font-light">
                O NBP-Núcleo Brasileiro de Psicanálise possui o registro oficial de pessoa jurídica CJAH-BR 2290 na ABRATH.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
