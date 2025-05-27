/**
 * Service for handling Steam account linking
 */

import { validateSteamLinkData, isValidWalletAddress } from '@/utils/validation';
import { formatErrorMessage, formatWalletAddress } from '@/utils/format';
import { API_ENDPOINTS } from '@/constants/api';
import type { 
  SteamLinkData, 
  SteamLinkResponse, 
  SteamLinkStatus,
  ApiResponse,
  SteamUser
} from '@/types';

/**
 * Service for handling Steam account linking operations
 */
class SteamService {
  /**
   * Links a Steam account to a wallet address
   * @param data Steam account details and wallet address
   * @returns Response with success status and data
   */
  async linkSteamAccount(data: SteamLinkData): Promise<SteamLinkResponse> {
    try {
      // Validate input data
      const validation = validateSteamLinkData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      console.log('steamService: Attempting to link Steam account', {
        wallet: formatWalletAddress(data.wallet_address),
        steam_id: data.steam_id,
        steam_username: data.steam_username
      });
      
      const response = await this.makeApiRequest<SteamLinkResponse>(
        API_ENDPOINTS.STEAM_LINK,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      console.log('steamService: Response received:', response);
      return response;
    } catch (error) {
      console.error('steamService: Error linking Steam account:', error);
      return this.handleServiceError(error);
    }
  }

  /**
   * Checks if a wallet address has a Steam account linked
   * @param walletAddress The wallet address to check
   * @returns Object with isLinked status and steam data if linked
   */
  async checkSteamLinkStatus(walletAddress: string): Promise<SteamLinkStatus> {
    try {
      if (!walletAddress) {
        throw new Error('Wallet address is required');
      }

      if (!isValidWalletAddress(walletAddress)) {
        console.error('steamService: Invalid wallet address format');
        return { isLinked: false };
      }

      console.log('steamService: Checking link status for wallet', 
        formatWalletAddress(walletAddress));
      
      const url = `${API_ENDPOINTS.STEAM_LINK_STATUS}?wallet=${encodeURIComponent(walletAddress)}`;
      const response = await this.makeApiRequest<ApiResponse<SteamUser>>(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('steamService: Link status:', {
        success: response.success,
        isLinked: response.success && !!response.data?.steam_id,
        steam_username: response.data?.steam_username
      });
      
      return {
        isLinked: response.success && !!response.data?.steam_id,
        steamData: response.data
      };
    } catch (error) {
      console.error('Steam link check failed:', error);
      return { isLinked: false };
    }
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
      console.error('steamService: HTTP Error:', response.status, errorText);
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Handles service errors and returns appropriate error response
   * @param error The error to handle
   * @returns Formatted error response
   */
  private handleServiceError(error: unknown): SteamLinkResponse {
    const errorMessage = formatErrorMessage(error);
    
    if (error instanceof TypeError && errorMessage.includes('fetch')) {
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet.',
      };
    }
    
    return {
      success: false,
      error: 'Error al vincular la cuenta de Steam. Por favor intenta de nuevo.',
    };
  }
}

// Create and export a singleton instance
const steamService = new SteamService();

export const linkSteamAccount = steamService.linkSteamAccount.bind(steamService);
export const checkSteamLinkStatus = steamService.checkSteamLinkStatus.bind(steamService);

export default steamService;