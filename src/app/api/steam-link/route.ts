import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface SteamLinkRequest {
  wallet_address: string;
  steam_id: string;
  steam_username: string;
  steam_avatar?: string;
  steam_profile_url?: string;
}

// Define interface for wallet data
interface WalletData {
  steam_id: string | null;
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== INICIO STEAM-LINK API ===');
    
    // Extract data from request
    const data = await req.json() as SteamLinkRequest;

    console.log('API steam-link: Datos recibidos para vinculación:', {
      wallet_address: data.wallet_address?.slice(0, 8) + '...',
      steam_id: data.steam_id,
      steam_username: data.steam_username,
      has_avatar: !!data.steam_avatar,
      has_profile_url: !!data.steam_profile_url
    });
    
    // Validate required fields
    if (!data.wallet_address || !data.steam_id || !data.steam_username) {
      console.error('API steam-link: Faltan campos requeridos:', { 
        wallet_address: !!data.wallet_address, 
        steam_id: !!data.steam_id, 
        steam_username: !!data.steam_username 
      });
      
      return NextResponse.json({ 
        success: false, 
        error: 'Faltan campos requeridos: wallet_address, steam_id y steam_username' 
      }, { status: 400 });
    }
    
    // Validate Steam ID format (should be 17 digits)
    if (!/^[0-9]{17}$/.test(data.steam_id)) {
      console.error('API steam-link: Steam ID inválido:', data.steam_id);
      return NextResponse.json({ 
        success: false, 
        error: 'Steam ID inválido (debe tener 17 dígitos)' 
      }, { status: 400 });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(data.wallet_address)) {
      console.error('API steam-link: Wallet address inválida:', data.wallet_address);
      return NextResponse.json({ 
        success: false, 
        error: 'Dirección de wallet inválida' 
      }, { status: 400 });
    }
    
    // Acceder a la DB de Cloudflare D1
    const context = getCloudflareContext();
    console.log('API steam-link: Contexto de Cloudflare obtenido:', !!context);
    
    const db = context?.env?.CLOUDFLARE_DB;
    
    if (!db) {
      console.error('API steam-link: D1 database not available. Context:', {
        hasContext: !!context,
        hasEnv: !!context?.env,
        hasCloudflareDB: !!context?.env?.CLOUDFLARE_DB
      });
      return NextResponse.json({
        success: false,
        error: 'Error de configuración de base de datos'
      }, { status: 500 });
    }
    
    console.log('API steam-link: Conexión a base de datos establecida');
    
    let dbOperationResult = null;
    
    // Check if the Steam ID is already linked to another wallet
    try {
      console.log('API steam-link: Verificando si el Steam ID ya está vinculado...');
      const existingSteamUser = await db
        .prepare("SELECT wallet_address FROM users WHERE steam_id = ?")
        .bind(data.steam_id)
        .first();
      
      console.log('API steam-link: Resultado de búsqueda por steam_id:', !!existingSteamUser);
      
      if (existingSteamUser && existingSteamUser.wallet_address !== data.wallet_address) {
        console.log('API steam-link: Steam ID ya vinculado a otra wallet');
        return NextResponse.json({ 
          success: false, 
          error: 'Esta cuenta de Steam ya está vinculada a otra wallet' 
        }, { status: 409 });
      }
    } catch (error) {
      console.error('API steam-link: Error al verificar Steam ID existente:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al verificar Steam ID: ' + (error instanceof Error ? error.message : String(error))
      }, { status: 500 });
    }
    
    // Check if the wallet already has a linked Steam account
    try {
      console.log('API steam-link: Verificando si la wallet ya tiene una cuenta Steam...');
      const existingWallet = await db
        .prepare("SELECT steam_id FROM users WHERE wallet_address = ?")
        .bind(data.wallet_address)
        .first() as WalletData | null;
      
      console.log('API steam-link: Resultado de búsqueda por wallet:', {
        found: !!existingWallet,
        hasSteamId: !!existingWallet?.steam_id
      });
      
      // If wallet exists but no Steam ID, update the record
      if (existingWallet) {
        if (existingWallet.steam_id) {
          console.log('API steam-link: Wallet ya tiene una cuenta Steam vinculada:', existingWallet.steam_id);
          return NextResponse.json({ 
            success: false, 
            error: 'Esta wallet ya tiene una cuenta de Steam vinculada' 
          }, { status: 409 });
        }
        
        console.log('API steam-link: Actualizando wallet existente con info de Steam');
        // Update the existing wallet with Steam info
        dbOperationResult = await db
          .prepare(`
            UPDATE users 
            SET steam_id = ?, steam_username = ?, steam_avatar = ?, steam_profile_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE wallet_address = ?
          `)
          .bind(
            data.steam_id, 
            data.steam_username,
            data.steam_avatar || null,
            data.steam_profile_url || null,
            data.wallet_address
          )
          .run();
  
        console.log('API steam-link: Wallet actualizada, resultado:', {
          success: dbOperationResult?.success,
          meta: dbOperationResult?.meta
        });
      } else {
        console.log('API steam-link: Insertando nuevo registro');
        // Insert new record
        dbOperationResult = await db
          .prepare(`
            INSERT INTO users (wallet_address, steam_id, steam_username, steam_avatar, steam_profile_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `)
          .bind(
            data.wallet_address, 
            data.steam_id, 
            data.steam_username,
            data.steam_avatar || null,
            data.steam_profile_url || null
          )
          .run();
  
        console.log('API steam-link: Nuevo registro creado, resultado:', {
          success: dbOperationResult?.success,
          meta: dbOperationResult?.meta
        });
      }

      // Verificar que la operación fue exitosa
      if (!dbOperationResult?.success) {
        console.error('API steam-link: Operación de base de datos falló:', dbOperationResult);
        return NextResponse.json({ 
          success: false, 
          error: 'Error al guardar en la base de datos' 
        }, { status: 500 });
      }

    } catch (error) {
      console.error('API steam-link: Error al verificar/insertar en la base de datos:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error al procesar la base de datos: ' + (error instanceof Error ? error.message : String(error))
      }, { status: 500 });
    }

    // Return success response with linked data
    console.log('API steam-link: Vinculación completada con éxito');
    console.log('=== FIN STEAM-LINK API (ÉXITO) ===');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cuenta de Steam vinculada correctamente',
      data: {
        wallet_address: data.wallet_address,
        steam_id: data.steam_id,
        steam_username: data.steam_username
      }
    });
  } catch (error) {
    console.error('=== ERROR GENERAL EN STEAM-LINK API ===');
    console.error('Error al vincular cuenta de Steam:', error);
    console.error('=== FIN ERROR ===');
    
    return NextResponse.json({ 
      success: false, 
      error: 'Error al vincular la cuenta de Steam: ' + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
} 