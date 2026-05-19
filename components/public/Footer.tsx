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

          <div className="col-span-1 md:col-span-1 flex items-start gap-4 justify-start md:justify-end text-xs font-bold uppercase tracking-widest">
            <a href="https://instagram.com/nbpsicanalise" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://facebook.com/nbpsicanalise" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Facebook
            </a>
            <a href="https://youtube.com/@nbpsicanalise" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              YouTube
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
