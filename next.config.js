const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Configuration pour le déploiement sur Render
  output: 'standalone',
  // Assurez-vous que l'application fonctionne correctement derrière un proxy
  poweredByHeader: false,
  // Optimisations pour la production
  reactStrictMode: true,
  swcMinify: true,
  // Inclure les fichiers de prompts dans le build standalone
  experimental: {
    outputFileTracingRoot: path.join(__dirname, './'),
    outputFileTracingIncludes: {
      'src/app/admin/**/actions.ts': ['./src/ai/prompts/**/*.txt'],
      'src/components/chat/actions.ts': ['./src/ai/prompts/**/*.txt'],
      'src/ai/flows/*.ts': ['./src/ai/prompts/**/*.txt'],
    },
  },
};

module.exports = nextConfig;
