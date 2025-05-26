import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Habilitar output standalone para Docker
  output: 'standalone',
  
  // Desabilitar ESLint durante build para deploy
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuração do Webpack para resolver aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
    };
    return config;
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
