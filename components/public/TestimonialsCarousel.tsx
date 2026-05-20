'use client'

import React, { useState, useEffect } from 'react'

interface Testimonial {
  text: string;
  author: string;
}

const testimonials: Testimonial[] = [
  {
    text: "A formação do NBP me proporcionou não apenas o conhecimento conceitual profundo, mas também a vivência clínica indispensável por meio da supervisão atenta dos professores. Uma experiência transformadora.",
    author: "MARIANA SILVA — ALUNA DE FORMAÇÃO"
  },
  {
    text: "O tripé psicanalítico é levado muito a sério no NBP. A teoria sólida aliada ao incentivo constante à análise pessoal e à supervisão me deu a segurança necessária para iniciar os meus atendimentos clínicos.",
    author: "RODRIGO MENDES — PSICANALISTA CLÍNICO"
  },
  {
    text: "Excelente corpo docente e infraestrutura de apoio. As aulas gravadas e os encontros ao vivo facilitam muito o aprendizado e a conciliação com a rotina profissional.",
    author: "CARLA REGINA — ALUNA DE ESPECIALIZAÇÃO"
  }
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="w-full bg-[#6a5a98]/80 py-16 md:py-24 text-white">
      <div className="max-w-[900px] mx-auto px-6 text-center flex flex-col items-center">
        
        {/* Subtitle / Title */}
        <span className="text-[12px] uppercase text-white/70 tracking-widest font-semibold mb-6 block">
          Depoimentos
        </span>
        <h2 className="text-2xl md:text-3.5xl font-bold tracking-wider uppercase mb-10" style={{ fontFamily: 'Raleway, sans-serif' }}>
          O QUE DIZEM SOBRE NÓS
        </h2>

        {/* Testimonial Content with smooth transitions */}
        <div className="min-h-[160px] flex flex-col justify-center items-center">
          <p className="text-[15px] md:text-[20px] font-light leading-relaxed italic text-white/90 max-w-3xl transition-opacity duration-500 ease-in-out">
            "{testimonials[currentIndex].text}"
          </p>
          <span className="text-[12px] font-bold tracking-widest text-[#d9d2eb] uppercase mt-6 block">
            {testimonials[currentIndex].author}
          </span>
        </div>

        {/* Indicators (Dots) */}
        <div className="flex gap-2.5 mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ver depoimento ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
