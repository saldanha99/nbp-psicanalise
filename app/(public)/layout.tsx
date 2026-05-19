import { Suspense } from 'react'
import { SmoothScroll } from '@/components/providers/SmoothScroll'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <Suspense>
        {children}
      </Suspense>
    </SmoothScroll>
  )
}
