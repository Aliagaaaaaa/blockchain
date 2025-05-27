import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

interface TradeUrlRequest {
  wallet_address: string;
  trade_url: string;
}

interface UserData {
  wallet_address: string;
  trade_url?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TradeUrlRequest;
    const { wallet_address, trade_url } = body;

    console.log('=== TRADE URL API INICIADO ===');
    console.log('Saving trade URL for wallet:', wallet_address);

    // Validate required fields
    if (!wallet_address || !trade_url) {
      return NextResponse.json({
        success: false,
        error: 'Faltan campos obligatorios: wallet_address y trade_url son requeridos',
      }, { status: 400 });
    }

    // Validate trade URL format
    const tradeUrlPattern = /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/;
    if (!tradeUrlPattern.test(trade_url)) {
      return NextResponse.json({
        success: false,
        error: 'URL de intercambio de Steam inválida',
      }, { status: 400 });
    }

    // Access Cloudflare D1 database
    const context = getCloudflareContext();
    const db = context?.env?.CLOUDFLARE_DB;

    if (!db) {
      console.error('Base de datos no disponible');
      return NextResponse.json({
        success: false,
        error: 'Error de configuración de base de datos',
      }, { status: 500 });
    }

    // Check if user exists
    const existingUser = await db
      .prepare("SELECT wallet_address FROM users WHERE wallet_address = ?")
      .bind(wallet_address)
      .first() as UserData | null;

    let dbResult;

    if (existingUser) {
      // Update existing user's trade URL
      console.log('Updating trade URL for existing user...');
      dbResult = await db
        .prepare(`
          UPDATE users 
          SET trade_url = ?, updated_at = CURRENT_TIMESTAMP
          WHERE wallet_address = ?
        `)
        .bind(trade_url, wallet_address)
        .run();
    } else {
      // Create new user with trade URL (this shouldn't happen in normal flow)
      console.log('Creating new user with trade URL...');
      dbResult = await db
        .prepare(`
          INSERT INTO users (wallet_address, trade_url, created_at, updated_at)
          VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `)
        .bind(wallet_address, trade_url)
        .run();
    }

    if (!dbResult?.success) {
      console.error('Error al guardar trade URL en base de datos:', dbResult);
      return NextResponse.json({
        success: false,
        error: 'Error al guardar la URL de intercambio',
      }, { status: 500 });
    }

    console.log('Trade URL guardada exitosamente');
    console.log('=== TRADE URL API COMPLETADO ===');

    return NextResponse.json({
      success: true,
      message: 'URL de intercambio guardada exitosamente',
      data: {
        wallet_address,
        trade_url,
      },
    });

  } catch (error) {
    console.error('=== ERROR EN TRADE URL API ===');
    console.error('Error al procesar la solicitud:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const wallet_address = url.searchParams.get('wallet_address');

    console.log('=== TRADE URL GET API INICIADO ===');
    console.log('Getting trade URL for wallet:', wallet_address);

    if (!wallet_address) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address es requerida',
      }, { status: 400 });
    }

    // Access Cloudflare D1 database
    const context = getCloudflareContext();
    const db = context?.env?.CLOUDFLARE_DB;

    if (!db) {
      console.error('Base de datos no disponible');
      return NextResponse.json({
        success: false,
        error: 'Error de configuración de base de datos',
      }, { status: 500 });
    }

    // Get user's trade URL
    const user = await db
      .prepare("SELECT trade_url FROM users WHERE wallet_address = ?")
      .bind(wallet_address)
      .first() as UserData | null;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
      }, { status: 404 });
    }

    console.log('Trade URL retrieved successfully');
    console.log('=== TRADE URL GET API COMPLETADO ===');

    return NextResponse.json({
      success: true,
      data: {
        wallet_address,
        trade_url: user.trade_url || null,
      },
    });

  } catch (error) {
    console.error('=== ERROR EN TRADE URL GET API ===');
    console.error('Error al procesar la solicitud:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { status: 500 });
  }
} 