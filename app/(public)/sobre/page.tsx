import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { whatsappLink, WHATSAPP_NUMBER } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre Nós — NBP Psicanálise',
  description: 'Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação e eventos focados no estudo contínuo e aprofundado da Psicanálise.',
}

export default function SobrePage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen text-[#333]">
      <Header />
      <main>
        {/* Hero */}
        <section className="w-full py-16 md:py-24 bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 text-center">
            <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 inline-flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
              Núcleo Psicanalítico
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-[#6a5a98] leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              NÚCLEO BRASILEIRO DE PSICANÁLISE
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[30px] font-light text-gray-700 max-w-3xl mx-auto">
              Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé. Oferecemos curso de formação para você que deseja tornar-se um profissional da área, e/ou conhecer, aprofundar-se no universo psicanalítico.
            </p>
          </div>
        </section>

        {/* Endereço e contato */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-12 bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-lg">
            <div>
              <h2 className="text-2xl font-bold text-[#6a5a98] mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                NOSSA LOCALIZAÇÃO
              </h2>
              <div className="text-[15px] leading-[26px] text-gray-700 space-y-1">
                <p>NBP Psicanálise</p>
                <p>Bairro Tatuapé</p>
                <p>São Paulo – SP</p>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#6a5a98] mb-6" style={{ fontFamily: 'Raleway, sans-serif' }}>
                CONTATO
              </h2>
              <div className="text-[15px] leading-[26px] text-gray-700 space-y-2 mb-8">
                <p>📱 WhatsApp/Telefone Disponível</p>
                <p>📧 contato@nbpsicanalise.com.br</p>
              </div>
              <a
                href={whatsappLink(WHATSAPP_NUMBER, 'Olá! Gostaria de saber mais sobre a NBP Psicanálise.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#6a5a98] hover:bg-[#584885] text-white font-medium px-8 py-3 rounded transition-colors text-[14px]"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
