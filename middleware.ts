import { NextRequest, NextResponse } from 'next/server';

export interface CloudflareEnv {
  CLOUDFLARE_DB: D1Database;
}

export function middleware(request: NextRequest) {
  // No necesitamos hacer nada especial, solo asegurarnos de que el binding de D1
  // esté disponible en las rutas de API
  return NextResponse.next();
}

// Configurar el middleware para que solo se ejecute en las rutas de API
export const config = {
  matcher: '/api/:path*',
};

// Este middleware permite que las API Routes de Next.js 
// accedan a los bindings de Cloudflare a través de process.env
// siempre que el proyecto se ejecute en Cloudflare Pages 