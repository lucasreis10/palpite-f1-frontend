import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilitar ESLint durante build para deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configurações de imagem
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
