/**
 * Service for handling Steam inventory operations
 */

import { API_ENDPOINTS } from '@/constants/api';
import type { 
  SteamInventoryResponse,
  SteamInventoryItem,
  ApiResponse
} from '@/types';

/**
 * Service for handling Steam inventory operations
 */
class InventoryService {
  /**
   * Fetches the Steam inventory for Counter Strike 2
   * @param steamId The Steam ID of the user
   * @param startAssetId Optional asset ID to start from for pagination
   * @returns Response with inventory items
   */
  async getSteamInventory(
    steamId: string, 
    startAssetId?: string
  ): Promise<SteamInventoryResponse> {
    try {
      if (!steamId) {
        throw new Error('Steam ID is required');
      }

      console.log('inventoryService: Fetching inventory for Steam ID', steamId);
      
      const params = new URLSearchParams({
        steamId,
        appId: '730', // Counter Strike 2 App ID
        contextId: '2', // Inventory context for CS2
        count: '100', // Number of items to fetch
      });

      if (startAssetId) {
        params.append('start_assetid', startAssetId);
      }

      const url = `${API_ENDPOINTS.STEAM_INVENTORY}?${params.toString()}`;
      
      const response = await this.makeApiRequest<SteamInventoryResponse>(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('inventoryService: Inventory response:', {
        success: response.success,
        itemCount: response.assets?.length || 0,
        totalCount: response.total_inventory_count
      });
      
      return response;
    } catch (error) {
      console.error('inventoryService: Error fetching inventory:', error);
      return this.handleServiceError(error);
    }
  }

  /**
   * Processes raw inventory data to combine assets with descriptions
   * @param inventoryResponse Raw inventory response from Steam API
   * @returns Processed inventory items
   */
  processInventoryItems(inventoryResponse: SteamInventoryResponse): SteamInventoryItem[] {
    if (!inventoryResponse.success || !inventoryResponse.assets || !inventoryResponse.descriptions) {
      return [];
    }

    const { assets, descriptions } = inventoryResponse;
    
    return assets.map(asset => {
      const description = descriptions.find(
        desc => desc.classid === asset.classid && desc.instanceid === asset.instanceid
      );

      if (!description) {
        return {
          ...asset,
          market_hash_name: '',
          market_name: '',
          name: 'Unknown Item',
          type: 'Unknown',
          icon_url: '',
          tradable: 0,
          marketable: 0,
          commodity: 0,
        };
      }

      return {
        ...asset,
        market_hash_name: description.market_hash_name,
        market_name: description.market_name,
        name: description.name,
        name_color: description.name_color,
        type: description.type,
        icon_url: description.icon_url,
        icon_url_large: description.icon_url_large,
        tradable: description.tradable,
        marketable: description.marketable,
        commodity: description.commodity,
        market_tradable_restriction: description.market_tradable_restriction,
        market_marketable_restriction: description.market_marketable_restriction,
        descriptions: description.descriptions,
        tags: description.tags,
        actions: description.actions,
        market_actions: description.market_actions,
      };
    });
  }

  /**
   * Makes an API request with proper error handling
   * @param url The API endpoint URL
   * @param options Fetch options
   * @returns Parsed response data
   */
  private async makeApiRequest<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('inventoryService: HTTP Error:', response.status, errorText);
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Handles service errors and returns appropriate error response
   * @param error The error to handle
   * @returns Formatted error response
   */
  private handleServiceError(error: unknown): SteamInventoryResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof TypeError && errorMessage.includes('fetch')) {
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
    
    return {
      success: false,
      error: 'Error al cargar el inventario. Por favor intenta de nuevo.',
    };
  }
}

// Create and export a singleton instance
const inventoryService = new InventoryService();

export const getSteamInventory = inventoryService.getSteamInventory.bind(inventoryService);
export const processInventoryItems = inventoryService.processInventoryItems.bind(inventoryService);

export default inventoryService; 