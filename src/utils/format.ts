// UI Constants
const UI_CONSTANTS = {
  REDIRECT_DELAY: 500,
  WALLET_ADDRESS_DISPLAY_LENGTH: {
    START: 6,
    END: 4,
  },
} as const;

/**
 * Formats a wallet address for display by showing first and last characters
 * @param address - The full wallet address
 * @param startLength - Number of characters to show at the start (default: 6)
 * @param endLength - Number of characters to show at the end (default: 4)
 * @returns Formatted address string
 */
export const formatWalletAddress = (
  address: string,
  startLength: number = UI_CONSTANTS.WALLET_ADDRESS_DISPLAY_LENGTH.START,
  endLength: number = UI_CONSTANTS.WALLET_ADDRESS_DISPLAY_LENGTH.END
): string => {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Safely parses JSON with error handling
 * @param jsonString - The JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export const safeJsonParse = <T = unknown>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
};

/**
 * Formats error messages for consistent display
 * @param error - Error object or string
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
}; 