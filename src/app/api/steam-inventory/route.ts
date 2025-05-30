import { NextRequest, NextResponse } from 'next/server';

// Steam API response interfaces
interface SteamInventoryAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  pos: number;
}

interface SteamInventoryDescription {
  appid: number;
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  icon_url_large?: string;
  descriptions?: Array<{
    type: string;
    value: string;
    color?: string;
  }>;
  tradable: number;
  actions?: Array<{
    link: string;
    name: string;
  }>;
  name: string;
  name_color?: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  market_actions?: Array<{
    link: string;
    name: string;
  }>;
  commodity: number;
  market_tradable_restriction: number;
  market_marketable_restriction: number;
  marketable: number;
  tags?: Array<{
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }>;
}

interface SteamInventoryResponse {
  success: number;
  total_inventory_count?: number;
  assets?: SteamInventoryAsset[];
  descriptions?: SteamInventoryDescription[];
  more_items?: number;
  last_assetid?: string;
  more_start?: number;
  error?: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log('=== INICIO STEAM-INVENTORY API ===');
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const steamId = searchParams.get('steamId');
    const appId = searchParams.get('appId') || '730'; // CS2 App ID
    const contextId = searchParams.get('contextId') || '2'; // CS2 context
    const count = searchParams.get('count') || '100';
    const startAssetId = searchParams.get('start_assetid');

    console.log('API steam-inventory: Parámetros recibidos:', {
      steamId: steamId?.slice(0, 8) + '...',
      appId,
      contextId,
      count,
      startAssetId
    });
    
    // Validate required parameters
    if (!steamId) {
      console.error('API steam-inventory: Steam ID es requerido');
      return NextResponse.json({ 
        success: false, 
        error: 'Steam ID es requerido' 
      }, { status: 400 });
    }
    
    // Validate Steam ID format (should be 17 digits)
    if (!/^[0-9]{17}$/.test(steamId)) {
      console.error('API steam-inventory: Steam ID inválido:', steamId);
      return NextResponse.json({ 
        success: false, 
        error: 'Steam ID inválido (debe tener 17 dígitos)' 
      }, { status: 400 });
    }

    // Build Steam API URL
    let steamApiUrl = `https://steamcommunity.com/inventory/${steamId}/${appId}/${contextId}?l=english&count=${count}`;
    
    if (startAssetId) {
      steamApiUrl += `&start_assetid=${startAssetId}`;
    }

    console.log('API steam-inventory: Llamando a Steam API...');
    
    // Call Steam API
    const steamResponse = await fetch(steamApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('API steam-inventory: Respuesta de Steam API:', {
      status: steamResponse.status,
      statusText: steamResponse.statusText,
      ok: steamResponse.ok
    });

    if (!steamResponse.ok) {
      // Handle specific Steam API errors
      if (steamResponse.status === 403) {
        return NextResponse.json({ 
          success: false, 
          error: 'El inventario de Steam es privado. Por favor, haz tu inventario público en la configuración de privacidad de Steam.' 
        }, { status: 403 });
      }
      
      if (steamResponse.status === 500) {
        return NextResponse.json({ 
          success: false, 
          error: 'El inventario de Steam no está disponible temporalmente. Intenta de nuevo más tarde.' 
        }, { status: 500 });
      }

      throw new Error(`Steam API error: ${steamResponse.status} ${steamResponse.statusText}`);
    }

    const steamData = await steamResponse.json() as SteamInventoryResponse;
    
    console.log('API steam-inventory: Datos recibidos de Steam:', {
      success: steamData.success,
      totalInventoryCount: steamData.total_inventory_count,
      assetsCount: steamData.assets?.length || 0,
      descriptionsCount: steamData.descriptions?.length || 0,
      hasMoreItems: !!steamData.more_items
    });

    // Check if Steam returned success
    if (steamData.success !== 1) {
      console.log('API steam-inventory: Steam API retornó success:', steamData.success);
      return NextResponse.json({ 
        success: false, 
        error: 'No se pudo obtener el inventario de Steam. Puede estar vacío o no disponible.' 
      }, { status: 200 }); // Return 200 but with success: false for empty inventory
    }

    // Return the Steam inventory data
    console.log('API steam-inventory: Inventario obtenido con éxito');
    console.log('=== FIN STEAM-INVENTORY API (ÉXITO) ===');
    
    return NextResponse.json({
      success: true,
      total_inventory_count: steamData.total_inventory_count || 0,
      assets: steamData.assets || [],
      descriptions: steamData.descriptions || [],
      more_items: steamData.more_items || 0,
      last_assetid: steamData.last_assetid,
      more_start: steamData.more_start
    });

  } catch (error) {
    console.error('API steam-inventory: Error:', error);
    console.log('=== FIN STEAM-INVENTORY API (ERROR) ===');
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Handle network errors
    if (errorMessage.includes('fetch')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Error de conexión con Steam. Verifica tu conexión a internet.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor al obtener el inventario.' 
    }, { status: 500 });
  }
}