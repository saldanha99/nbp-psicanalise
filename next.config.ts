import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cursos.nbpsicanalise.com.br',
      },
      {
        protocol: 'https',
        hostname: 'nbpsicanalise.com.br',
      },
    ],
  },
}

export default nextConfig
