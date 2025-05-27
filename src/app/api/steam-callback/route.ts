import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Configuración de OpenID para Steam
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Interfaces para la respuesta de la API de Steam
interface SteamPlayer {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff?: number;
  personastate: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

interface SteamPlayerSummaryResponse {
  response: {
    players: SteamPlayer[];
  };
}

interface WalletData {
  steam_id: string | null;
}

interface SteamUserInfo {
  steamId: string;
  username: string;
  avatar: string;
  profileUrl: string;
  country?: string;
  steamProfileData: SteamPlayer;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    
    console.log('=== STEAM CALLBACK INICIADO ===');
    console.log('Steam callback recibido, URL:', req.url);
    
    // Extraer wallet address del parámetro
    const walletAddress = params.get('wallet');
    if (!walletAddress) {
      console.error('Error: No wallet address provided in callback');
      return NextResponse.redirect(`${FRONTEND_URL}?error=missing_wallet&message=No se proporcionó dirección de wallet`);
    }
    
    console.log('Wallet address recibida:', walletAddress);
    
    // Crear un objeto con todos los datos recibidos de Steam para debug
    const steamData: Record<string, string> = {};
    params.forEach((value, key) => {
      if (key !== 'wallet') { // Excluir wallet de los datos de Steam
        steamData[key] = value;
      }
    });
    
    console.log('DATOS COMPLETOS DE STEAM:', steamData);

    // Verificar que la respuesta es para nuestra solicitud
    if (params.get('openid.ns') !== 'http://specs.openid.net/auth/2.0') {
      console.error('Error: Respuesta con formato incorrecto');
      return NextResponse.redirect(`${FRONTEND_URL}?error=invalid_response&message=Respuesta de Steam inválida`);
    }

    // Verificar que el modo es 'id_res'
    if (params.get('openid.mode') !== 'id_res') {
      console.error('Error: Modo incorrecto');
      return NextResponse.redirect(`${FRONTEND_URL}?error=invalid_mode&message=Modo de Steam incorrecto`);
    }

    // Construir los parámetros para la verificación
    const verifyParams = new URLSearchParams();
    
    // Copiar todos los parámetros originales excepto 'openid.mode' y 'wallet'
    for (const [key, value] of params.entries()) {
      if (key !== 'openid.mode' && key !== 'wallet') {
        verifyParams.append(key, value);
      }
    }
    
    // Cambiar el modo a 'check_authentication'
    verifyParams.append('openid.mode', 'check_authentication');
    
    console.log('Verificando autenticación con Steam...');
    
    // Realizar la solicitud de verificación a Steam
    const response = await fetch(STEAM_OPENID_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: verifyParams.toString()
    });
    
    if (!response.ok) {
      console.error('Error al verificar la autenticación:', response.statusText);
      return NextResponse.redirect(`${FRONTEND_URL}?error=verification_failed&message=Error al verificar con Steam`);
    }
    
    const responseText = await response.text();
    console.log('RESPUESTA DE LA VERIFICACIÓN DE STEAM:', responseText);
    
    // Verificar si la autenticación fue exitosa
    const isValid = responseText.includes('is_valid:true');
    
    if (!isValid) {
      console.error('Autenticación inválida');
      return NextResponse.redirect(`${FRONTEND_URL}?error=authentication_failed&message=Autenticación con Steam falló`);
    }
    
    // Extraer el ID de Steam del usuario desde la respuesta
    const steamId = params.get('openid.claimed_id')?.split('/').pop();
    
    if (!steamId) {
      console.error('No se encontró Steam ID');
      return NextResponse.redirect(`${FRONTEND_URL}?error=missing_steam_id&message=No se pudo obtener Steam ID`);
    }
    
    console.log('Steam ID obtenido:', steamId);
    
    // Información del usuario de Steam
    let steamUserInfo: SteamUserInfo;
    
    // Obtener información real del perfil de Steam
    try {
      const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;
      const profileResponse = await fetch(profileUrl);
      
      if (!profileResponse.ok) {
        console.error('Error al obtener información del perfil de Steam:', profileResponse.statusText);
        return NextResponse.redirect(`${FRONTEND_URL}?error=steam_api_error&message=Error al obtener datos de perfil de Steam`);
      }
      
      const profileData = await profileResponse.json() as SteamPlayerSummaryResponse;
      
      if (!profileData.response || 
          !profileData.response.players || 
          profileData.response.players.length === 0) {
        console.error('Datos de perfil de Steam incompletos o vacíos');
        return NextResponse.redirect(`${FRONTEND_URL}?error=steam_data_error&message=Datos de perfil de Steam incompletos`);
      }
      
      const player = profileData.response.players[0];
      console.log('DATOS DEL PERFIL DE STEAM:', player);
      
      steamUserInfo = {
        steamId,
        username: player.personaname,
        avatar: player.avatarfull || player.avatarmedium || player.avatar,
        profileUrl: player.profileurl,
        country: player.loccountrycode,
        steamProfileData: player, // Datos completos del perfil
      };
    } catch (profileError) {
      console.error('Error al obtener el perfil de Steam:', profileError);
      return NextResponse.redirect(`${FRONTEND_URL}?error=steam_profile_error&message=Error al procesar el perfil de Steam`);
    }
    
    console.log('=== GUARDANDO EN BASE DE DATOS ===');
    
    // Ahora guardar directamente en la base de datos
    try {
      // Acceder a la DB de Cloudflare D1
      const context = getCloudflareContext();
      const db = context?.env?.CLOUDFLARE_DB;
      
      if (!db) {
        console.error('Base de datos no disponible');
        return NextResponse.redirect(`${FRONTEND_URL}?error=db_error&message=Error de configuración de base de datos`);
      }
      
      // Validar que Steam ID no esté ya vinculado a otra wallet
      const existingSteamUser = await db
        .prepare("SELECT wallet_address FROM users WHERE steam_id = ?")
        .bind(steamId)
        .first();
      
      if (existingSteamUser && existingSteamUser.wallet_address !== walletAddress) {
        console.error('Steam ID ya vinculado a otra wallet');
        return NextResponse.redirect(`${FRONTEND_URL}?error=steam_linked&message=Esta cuenta de Steam ya está vinculada a otra wallet`);
      }
      
      // Verificar si la wallet ya tiene una cuenta Steam
      const existingWallet = await db
        .prepare("SELECT steam_id FROM users WHERE wallet_address = ?")
        .bind(walletAddress)
        .first() as WalletData | null;
      
      let dbResult;
      
      if (existingWallet) {
        if (existingWallet.steam_id && existingWallet.steam_id !== steamId) {
          console.error('Wallet ya tiene otra cuenta Steam vinculada');
          return NextResponse.redirect(`${FRONTEND_URL}?error=wallet_linked&message=Esta wallet ya tiene una cuenta de Steam diferente vinculada`);
        }
        
        // Actualizar registro existente
        console.log('Actualizando registro existente...');
        dbResult = await db
          .prepare(`
            UPDATE users 
            SET steam_id = ?, steam_username = ?, steam_avatar = ?, steam_profile_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE wallet_address = ?
          `)
          .bind(
            steamId,
            steamUserInfo.username,
            steamUserInfo.avatar,
            steamUserInfo.profileUrl,
            walletAddress
          )
          .run();
      } else {
        // Insertar nuevo registro
        console.log('Insertando nuevo registro...');
        dbResult = await db
          .prepare(`
            INSERT INTO users (wallet_address, steam_id, steam_username, steam_avatar, steam_profile_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `)
          .bind(
            walletAddress,
            steamId,
            steamUserInfo.username,
            steamUserInfo.avatar,
            steamUserInfo.profileUrl
          )
          .run();
      }
      
      if (!dbResult?.success) {
        console.error('Error al guardar en base de datos:', dbResult);
        return NextResponse.redirect(`${FRONTEND_URL}?error=db_save_error&message=Error al guardar la vinculación`);
      }
      
      console.log('¡Vinculación guardada exitosamente en base de datos!');
      console.log('=== STEAM CALLBACK COMPLETADO EXITOSAMENTE ===');
      
      // Redirigir al frontend con éxito
      const successData = {
        success: true,
        wallet_address: walletAddress,
        steam_id: steamId,
        steam_username: steamUserInfo.username,
        steam_avatar: steamUserInfo.avatar
      };
      
      const redirectUrl = `${FRONTEND_URL}?steam_link_success=true&data=${encodeURIComponent(JSON.stringify(successData))}`;
      return NextResponse.redirect(redirectUrl);
      
    } catch (dbError) {
      console.error('Error en base de datos:', dbError);
      return NextResponse.redirect(`${FRONTEND_URL}?error=db_error&message=Error al acceder a la base de datos`);
    }
    
  } catch (error) {
    console.error('=== ERROR GENERAL EN STEAM CALLBACK ===');
    console.error('Error al procesar la autenticación con Steam:', error);
    return NextResponse.redirect(`${FRONTEND_URL}?error=server_error&message=Error interno del servidor`);
  }
} 