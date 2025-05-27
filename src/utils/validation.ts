// Validation patterns
const VALIDATION_PATTERNS = {
  STEAM_ID: /^[0-9]{17}$/,
  WALLET_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRADE_URL: /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/,
} as const;

/**
 * Validates Steam ID format
 * @param steamId - The Steam ID to validate
 * @returns boolean indicating if the Steam ID is valid
 */
export const isValidSteamId = (steamId: string): boolean => {
  if (!steamId || typeof steamId !== 'string') {
    return false;
  }
  return VALIDATION_PATTERNS.STEAM_ID.test(steamId);
};

/**
 * Validates wallet address format (Ethereum address)
 * @param address - The wallet address to validate
 * @returns boolean indicating if the wallet address is valid
 */
export const isValidWalletAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return VALIDATION_PATTERNS.WALLET_ADDRESS.test(address);
};

/**
 * Validates Steam trade URL format
 * @param tradeUrl - The trade URL to validate
 * @returns boolean indicating if the trade URL is valid
 */
export const isValidTradeUrl = (tradeUrl: string): boolean => {
  if (!tradeUrl || typeof tradeUrl !== 'string') {
    return false;
  }
  return VALIDATION_PATTERNS.TRADE_URL.test(tradeUrl);
};

/**
 * Validates required fields for Steam linking
 * @param data - Object containing wallet_address, steam_id, and steam_username
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateSteamLinkData = (data: {
  wallet_address?: string;
  steam_id?: string;
  steam_username?: string;
}): { isValid: boolean; error?: string } => {
  if (!data.wallet_address || !data.steam_id || !data.steam_username) {
    return {
      isValid: false,
      error: 'Faltan campos obligatorios: wallet_address, steam_id y steam_username son requeridos',
    };
  }

  if (!isValidWalletAddress(data.wallet_address)) {
    return {
      isValid: false,
      error: 'Dirección de wallet inválida',
    };
  }

  if (!isValidSteamId(data.steam_id)) {
    return {
      isValid: false,
      error: 'Steam ID inválido (debe ser un número de 17 dígitos)',
    };
  }

  return { isValid: true };
};

/**
 * Validates trade URL data
 * @param data - Object containing wallet_address and trade_url
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateTradeUrlData = (data: {
  wallet_address?: string;
  trade_url?: string;
}): { isValid: boolean; error?: string } => {
  if (!data.wallet_address || !data.trade_url) {
    return {
      isValid: false,
      error: 'Faltan campos obligatorios: wallet_address y trade_url son requeridos',
    };
  }

  if (!isValidWalletAddress(data.wallet_address)) {
    return {
      isValid: false,
      error: 'Dirección de wallet inválida',
    };
  }

  if (!isValidTradeUrl(data.trade_url)) {
    return {
      isValid: false,
      error: 'URL de intercambio de Steam inválida',
    };
  }

  return { isValid: true };
}; 