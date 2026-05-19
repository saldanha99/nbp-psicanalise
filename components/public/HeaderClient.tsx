'use client';

import React from 'react';
import Link from 'next/link';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/sobre', label: 'Sobre Nós' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/#contato', label: 'Contato' },
];

export interface HeaderClientProps {
  logoUrl?: string;
  bannerAtivo?: string;
  bannerTexto?: string;
}

export function HeaderClient({ logoUrl, bannerAtivo = 'false', bannerTexto = '' }: HeaderClientProps) {
  const [open, setOpen] = React.useState(false);

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
      <header className="w-full bg-white border-b border-gray-100 z-50 sticky top-0">
        <nav className="mx-auto w-full max-w-[1200px] flex h-24 items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center z-50" onClick={() => setOpen(false)}>
            <img 
              src={logoUrl || "https://nbpsicanalise.com.br/wp-content/uploads/2021/03/Logo-NBP-Oficial-min.png"} 
              alt="NBP Psicanálise" 
              className="h-14 w-auto object-contain" 
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
            <Link
              href="/minha-area"
              className="text-[#333] hover:text-[#6a5a98] font-semibold text-[12px] uppercase tracking-wider transition-colors font-[family-name:var(--font-heading)]"
            >
              Minha Área
            </Link>
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
              <Link
                href="/minha-area"
                className="text-lg font-bold text-[#6a5a98] uppercase tracking-wider border-b border-gray-100 pb-2"
                onClick={() => setOpen(false)}
              >
                Minha Área
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
