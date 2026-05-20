'use client'

import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-[#1A1A1A] text-[#999999] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <img 
              src="https://nbpsicanalise.com.br//wp-content/uploads/2019/06/logo-footer-min.png" 
              alt="Logo NBP Footer" 
              className="w-24 mb-6"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
            <p className="text-sm">
              Somos um núcleo de Psicanálise, com sede na cidade de São Paulo, no bairro Tatuapé.
            </p>
            <p className="text-sm">R. Prof. Roberval Fróes, 244 - São Paulo, SP</p>
            <p className="text-sm">contato@nbpsicanalise.com.br</p>
          </div>

          <div className="col-span-1 md:col-span-1 flex items-center gap-3 justify-start md:justify-end">
            <a 
              href="https://instagram.com/nbpsicanalise" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#6a5a98] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/10"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a 
              href="https://facebook.com/nbpsicanalise" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#6a5a98] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/10"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a 
              href="https://youtube.com/@nbpsicanalise" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#6a5a98] text-gray-400 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/10"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                <polygon points="10 15 15 12 10 9" fill="currentColor" />
              </svg>
            </a>
          </div>

        </div>

        <div className="border-t border-[#333333] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} NBP Psicanálise. Todos os direitos reservados.
          </p>
          <a href="https://estudiopino.com/" target="_blank" rel="noopener noreferrer">
            <img 
              src="https://nbpsicanalise.com.br/wp-content/uploads/2019/06/pino.png" 
              alt="Site desenvolvido pelo Estúdio Pino" 
              className="w-16 opacity-50 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}


