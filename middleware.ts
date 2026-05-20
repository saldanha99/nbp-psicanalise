export { auth as middleware } from '@/lib/auth/config'

export const config = {
  // Protege apenas rotas admin — deixa tudo público funcionar normalmente
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
