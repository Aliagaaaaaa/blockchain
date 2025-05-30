import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // This will ignore ESLint errors during builds
  },
  // Configurar headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.reown.com *.walletconnect.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: *.steamstatic.com *.steampowered.com",
              "font-src 'self' data:",
              "connect-src 'self' *.reown.com *.walletconnect.com *.steampowered.com wss: https:",
              "frame-src 'self' *.reown.com *.walletconnect.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
