import { NextRequest, NextResponse } from 'next/server';

// Configuración de OpenID para Steam
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const walletAddress = url.searchParams.get('wallet');
    
    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address is required. Use: /api/steam-auth?wallet=0x...'
      }, { status: 400 });
    }

    // Validar formato de wallet
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address format'
      }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Incluir wallet address en el return_to URL
    const REDIRECT_URL = `${baseUrl}/api/steam-callback?wallet=${encodeURIComponent(walletAddress)}`;
    
    console.log('Steam auth iniciado, redirect URL:', REDIRECT_URL);
    console.log('Wallet address:', walletAddress);
    
    // Construir los parámetros para la autenticación OpenID
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': REDIRECT_URL,
      'openid.realm': new URL(REDIRECT_URL).origin,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    // Construir la URL completa para la redirección
    const authUrl = `${STEAM_OPENID_URL}?${params.toString()}`;
    
    console.log('URL de autenticación Steam:', authUrl);

    // Redirigir al usuario a Steam
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error al iniciar la autenticación con Steam:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al iniciar la autenticación con Steam' 
    }, { status: 500 });
  }
} 