import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
})

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: {
    default: 'NBP Psicanálise | Formação e Cursos',
    template: '%s | NBP Psicanálise',
  },
  description:
    'Núcleo Brasileiro de Psicanálise. Cursos de formação, eventos e muito mais.',
  keywords: ['psicanálise', 'cursos', 'formação', 'NBP', 'eventos'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://nbpsicanalise.com.br',
    siteName: 'NBP Psicanálise',
  },
  icons: {
    icon: 'https://nbpsicanalise.com.br/wp-content/uploads/2021/03/Logo-NBP-Oficial-min.png',
    shortcut: 'https://nbpsicanalise.com.br/wp-content/uploads/2021/03/Logo-NBP-Oficial-min.png',
    apple: 'https://nbpsicanalise.com.br/wp-content/uploads/2021/03/Logo-NBP-Oficial-min.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
