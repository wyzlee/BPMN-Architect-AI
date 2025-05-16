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
    outputFileTracingIncludes: {
      '/src/ai/prompts/*': ['./src/ai/prompts/**/*'],
      '/admin/correction-prompt': ['./src/ai/prompts/bpmn-correction-prompt.txt'],
      '/admin/refinement-prompt': ['./src/ai/prompts/bpmn-refinement-prompt.txt'],
      '/admin/system-prompt': ['./src/ai/prompts/bpmn-generation-prompt.txt'],
      '/admin/validation-prompt': ['./src/ai/prompts/bpmn-validation-prompt.txt'],
    },
  },
};

module.exports = nextConfig;
