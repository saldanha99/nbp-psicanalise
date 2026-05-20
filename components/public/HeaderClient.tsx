'use client';

import React from 'react';
import Link from 'next/link';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { WHATSAPP_NUMBER } from '@/lib/utils';

const navLinks = [
  { href: '/sobre', label: 'Quem Somos' },
  { href: '/cursos', label: 'Cursos / Eventos' },
  { href: '/psicanalistas', label: 'Psicanalistas' },
  { href: '/sobre#clinica', label: 'Clínica' },
  { href: '/textos', label: 'Textos' },
];

export interface HeaderClientProps {
  logoUrl?: string;
  bannerAtivo?: string;
  bannerTexto?: string;
}

export function HeaderClient({ logoUrl, bannerAtivo = 'false', bannerTexto = '' }: HeaderClientProps) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className="w-full z-50 sticky top-0 transition-all duration-300 bg-transparent pointer-events-none"
      >
        <div
          className={`w-full transition-all duration-500 mx-auto pointer-events-auto ${
            scrolled
              ? 'max-w-[1160px] mt-4 bg-white/90 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-gray-200/50 rounded-2xl px-6'
              : 'bg-white border-b border-gray-100 rounded-none px-4 sm:px-6 lg:px-8'
          }`}
        >
          <nav
            className={`flex items-center justify-between transition-all duration-500 ${
              scrolled ? 'h-16' : 'h-24'
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center z-50" onClick={() => setOpen(false)}>
              <img
                src={logoUrl || 'https://nbpsicanalise.com.br/wp-content/uploads/2021/03/Logo-NBP-Oficial-min.png'}
                alt="NBP Psicanálise"
                className={`w-auto object-contain transition-all duration-500 ${
                  scrolled ? 'h-9' : 'h-14'
                }`}
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#333] hover:text-[#6a5a98] font-semibold text-[12px] uppercase tracking-wider transition-colors font-[family-name:var(--font-heading)]"
                >
                  {link.label}
                </Link>
              ))}

              {/* Icons Container */}
              <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                {/* User/Minha Área Icon */}
                <Link
                  href="/minha-area/auth/login"
                  title="Minha Área (Portal do Aluno)"
                  className="text-gray-500 hover:text-[#6a5a98] transition-colors p-2 rounded-full hover:bg-gray-50 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>

                {/* Admin/Gear Icon */}
                <Link
                  href="/auth/login"
                  title="Acesso Administrativo"
                  className="text-gray-500 hover:text-[#6a5a98] transition-colors p-2 rounded-full hover:bg-gray-50 flex items-center justify-center"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </Link>
              </div>

              {/* Botão Fale Com A Gente */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Estou no site e gostaria de mais informações.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#6a5a98] hover:bg-[#584885] text-white font-bold text-[11px] uppercase tracking-wider px-5 py-3 rounded-full transition-colors font-[family-name:var(--font-heading)] shadow-sm"
              >
                Fale com a gente
              </a>
            </div>

            {/* Mobile Toggle */}
            <div className="flex items-center md:hidden z-50">
              <button
                onClick={() => setOpen(!open)}
                className="text-gray-600 p-2"
                aria-label="Abrir menu"
              >
                <MenuToggleIcon open={open} className="size-6" duration={300} />
              </button>
            </div>
          </nav>

          {/* Mobile Menu Overlay */}
          {open && (
            <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden overflow-y-auto">
              <div className="flex flex-col gap-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-bold text-[#333] hover:text-[#6a5a98] uppercase tracking-wider border-b border-gray-100 pb-2"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Quick Links Row */}
                <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 mt-2">
                  <Link
                    href="/minha-area/auth/login"
                    className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#6a5a98]"
                    onClick={() => setOpen(false)}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Minha Área</span>
                  </Link>

                  <Link
                    href="/auth/login"
                    className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#6a5a98]"
                    onClick={() => setOpen(false)}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Painel Admin</span>
                  </Link>
                </div>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Estou no site e gostaria de mais informações.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#6a5a98] hover:bg-[#584885] text-white font-bold text-sm uppercase tracking-wider py-4 rounded-xl transition-colors mt-2 text-center"
                  onClick={() => setOpen(false)}
                >
                  Fale com a gente
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
