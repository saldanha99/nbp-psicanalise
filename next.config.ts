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
      {
        // Vercel Blob — vídeos e imagens hospedados no nosso storage
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig
