import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { WhatsAppButton } from '@/components/public/WhatsAppButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Corpo Docente e Psicanalistas — NBP Psicanálise',
  description: 'Conheça os diretores, professores, psicanalistas e supervisores clínicos do Núcleo Brasileiro de Psicanálise, dedicados à formação clínica e transmissão da psicanálise.',
};

interface TeamMember {
  name: string;
  role: string;
  image: string;
  instagram: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Alessandra Duda Gonzales',
    role: 'Diretora / Professora / Psicanalista / Supervisora Clínica do NBP',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/aleduda_gonzales-560x560.jpg',
    instagram: 'https://instagram.com/aledudagonzales',
  },
  {
    name: 'Aurélio Gonzales',
    role: 'Diretor / Professor / Psicanalista / Supervisor Clínico do NBP',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2024/05/WhatsApp-Image-2024-05-08-at-14.55.05-560x560.jpeg',
    instagram: 'https://instagram.com/aurelio.gonzales',
  },
  {
    name: 'Camila Motta',
    role: 'Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/camila_mottapsicanalise-560x560.jpg',
    instagram: 'https://instagram.com/camila_mottapsicanalise',
  },
  {
    name: 'Estelita Neves',
    role: 'Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/11/Estelita-560x560.jpeg',
    instagram: 'https://www.instagram.com/psi_estelitaneves/',
  },
  {
    name: 'Fabiana Barros',
    role: 'Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2024/09/IMG-20240910-WA0108-560x560.jpg',
    instagram: 'https://instagram.com/fabiana.barros_psicanalista',
  },
  {
    name: 'Fabiola Diniz',
    role: 'Professora / Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/fabiola_dinizn-560x560.jpg',
    instagram: 'https://instagram.com/fabioladinizn',
  },
  {
    name: 'Iran Paulo',
    role: 'Psicanalista / Supervisor Clínico',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/iran_pauloo-560x560.jpg',
    instagram: 'https://instagram.com/ianpauloo',
  },
  {
    name: 'Joice Hilário',
    role: 'Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/joice_hillario-560x560.jpg',
    instagram: 'https://www.instagram.com/nbpsicanalise/',
  },
  {
    name: 'Leticia Gagliano',
    role: 'Psicóloga / Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/leticia_gaglian-560x560.jpg',
    instagram: 'https://instagram.com/leticia.gagliano',
  },
  {
    name: 'Renata Santana',
    role: 'Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/renata_santana-150x150.jpg',
    instagram: 'https://instagram.com/re.santana',
  },
  {
    name: 'Tatiane Moschella',
    role: 'Psicanalista / Supervisora Clínica',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/tati_moschella-560x560.jpg',
    instagram: 'https://instagram.com/tatimoschella',
  },
  {
    name: 'Vitor Porto',
    role: 'Psicanalista / Supervisor Clínico',
    image: 'https://nbpsicanalise.com.br/wp-content/uploads/2023/08/vitor_psicanalista-560x560.jpg',
    instagram: 'https://www.instagram.com/nbpsicanalise/',
  },
];

export default function PsicanalistasPage() {
  return (
    <div className="bg-[#f9f9f9] min-h-screen text-[#333]">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-4 text-center">
            <span className="text-[12px] uppercase text-[#6a5a98] tracking-widest font-semibold mb-4 inline-flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#6a5a98]"></span>
              Corpo Docente e Supervisão
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-[#6a5a98] leading-tight mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              NOSSOS PSICANALISTAS
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[30px] font-light text-gray-600 max-w-3xl mx-auto">
              Profissionais experientes, dedicados ao ensino continuado, supervisão clínica cuidadosa e à transmissão ética da psicanálise.
            </p>
          </div>
        </section>

        {/* Team Grid Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 hover:shadow-[0_12px_35px_rgba(106,90,152,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:scale-105 transition-all duration-500"
                    />
                  </div>

                  {/* Details Container */}
                  <div className="p-6 flex-1 flex flex-col justify-between items-center text-center">
                    <div className="flex flex-col items-center w-full flex-1">
                      {/* Name */}
                      <h2 
                        className="text-[17px] font-bold text-gray-800 tracking-wide uppercase group-hover:text-[#6a5a98] transition-colors leading-tight font-[family-name:var(--font-heading)]"
                      >
                        {member.name}
                      </h2>
                      {/* Decorative Line */}
                      <span className="w-8 h-[2px] bg-[#6a5a98]/30 my-4 block"></span>
                      {/* Roles */}
                      <p className="text-[11px] text-gray-500 font-semibold tracking-widest uppercase leading-relaxed mb-6 font-sans">
                        {member.role}
                      </p>
                    </div>

                    {/* Instagram Button */}
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#f9f9f9] text-[#6a5a98] hover:bg-[#6a5a98] hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm"
                      aria-label={`Instagram de ${member.name}`}
                    >
                      <svg 
                        className="w-4 h-4" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
