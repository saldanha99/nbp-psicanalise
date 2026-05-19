import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'
import { ContactForm } from '@/components/public/ContactForm'
import { whatsappLink, WHATSAPP_NUMBER } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato — NBP Psicanálise',
  description: 'Entre em contato com o Núcleo Brasileiro de Psicanálise.',
}

export default function ContatoPage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen text-[#333]">
      <Header />
      <main className="flex-1 py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-[#6a5a98] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              FALE CONOSCO
            </h1>
            <p className="text-gray-600 mt-3 text-[16px]">
              Envie sua mensagem ou entre em contato pelos nossos canais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-lg">
            <div>
              <ContactForm />
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-[#6a5a98] mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Nossos Contatos
                </h2>
                <div className="space-y-2 text-[15px] leading-[26px] text-gray-700">
                  <p>📱 WhatsApp e Telefone</p>
                  <p>📧 contato@nbpsicanalise.com.br</p>
                  <p>🕐 Atendimento Comercial</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#6a5a98] mb-4" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Localização
                </h2>
                <div className="space-y-2 text-[15px] leading-[26px] text-gray-700">
                  <p>NBP Psicanálise</p>
                  <p>Bairro Tatuapé</p>
                  <p>São Paulo – SP</p>
                </div>
              </div>

              <div>
                <a
                  href={whatsappLink(WHATSAPP_NUMBER, 'Olá! Gostaria de falar com o NBP Psicanálise.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#6a5a98] hover:bg-[#584885] text-white font-medium px-8 py-3 rounded transition-colors w-full md:w-auto"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
