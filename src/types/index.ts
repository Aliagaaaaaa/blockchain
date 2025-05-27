// Steam related types
export interface SteamUser {
  steam_id: string;
  steam_username: string;
  steam_avatar?: string;
  steam_profile_url?: string;
  trade_url?: string;
}

export interface SteamLinkData extends SteamUser {
  wallet_address: string;
}

export interface SteamLinkResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: SteamUser & { wallet_address: string };
}

export interface SteamLinkStatus {
  isLinked: boolean;
  steamData?: SteamUser;
}

// Trade URL types
export interface TradeUrlData {
  wallet_address: string;
  trade_url: string;
}

export interface TradeUrlResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: TradeUrlData;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Component Props types
export interface SteamLinkFormProps {
  walletAddress: string;
  onSuccess?: (data: SteamLinkData) => void;
  onError?: (error: string) => void;
}

export interface TradeUrlFormProps {
  walletAddress: string;
  onSuccess?: (data: TradeUrlData) => void;
  onError?: (error: string) => void;
}

// Hook return types
export interface UseSteamLinkReturn {
  steamLinked: boolean;
  steamData: SteamUser | null;
  isLoading: boolean;
  error: string | null;
  checkSteamLink: () => Promise<void>;
  clearError: () => void;
}

export interface UseTradeUrlReturn {
  tradeUrl: string | null;
  isLoading: boolean;
  error: string | null;
  saveTradeUrl: (url: string) => Promise<boolean>;
  clearError: () => void;
  loadTradeUrl: () => Promise<void>;
}

// Onboarding types
export type OnboardingStep = 'connect_wallet' | 'link_steam' | 'set_trade_url' | 'complete';

export interface OnboardingState {
  currentStep: OnboardingStep;
  isWalletConnected: boolean;
  isSteamLinked: boolean;
  hasTradeUrl: boolean;
  steamData?: SteamUser | null;
}

// URL params types
export interface SteamCallbackParams {
  error?: string;
  message?: string;
  steam_link_success?: string;
  data?: string;
} 