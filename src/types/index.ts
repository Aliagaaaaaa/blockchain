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

// Steam Inventory types for Counter Strike 2
export interface SteamInventoryItem {
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
  pos: number;
  id: string;
  market_hash_name: string;
  market_name: string;
  name: string;
  name_color?: string;
  type: string;
  icon_url: string;
  icon_url_large?: string;
  tradable: number;
  marketable: number;
  commodity: number;
  market_tradable_restriction?: number;
  market_marketable_restriction?: number;
  descriptions?: Array<{
    type: string;
    value: string;
    color?: string;
  }>;
  tags?: Array<{
    category: string;
    internal_name: string;
    localized_category_name: string;
    localized_tag_name: string;
    color?: string;
  }>;
  actions?: Array<{
    link: string;
    name: string;
  }>;
  market_actions?: Array<{
    link: string;
    name: string;
  }>;
}

export interface SteamInventoryResponse {
  success: boolean;
  total_inventory_count?: number;
  assets?: SteamInventoryItem[];
  descriptions?: Array<{
    appid: number;
    classid: string;
    instanceid: string;
    icon_url: string;
    icon_url_large?: string;
    name: string;
    market_hash_name: string;
    market_name: string;
    name_color?: string;
    background_color?: string;
    type: string;
    tradable: number;
    marketable: number;
    commodity: number;
    market_tradable_restriction?: number;
    market_marketable_restriction?: number;
    descriptions?: Array<{
      type: string;
      value: string;
      color?: string;
    }>;
    tags?: Array<{
      category: string;
      internal_name: string;
      localized_category_name: string;
      localized_tag_name: string;
      color?: string;
    }>;
    actions?: Array<{
      link: string;
      name: string;
    }>;
    market_actions?: Array<{
      link: string;
      name: string;
    }>;
  }>;
  error?: string;
  more_items?: number;
  last_assetid?: string;
  more_start?: number;
}

export interface InventoryFilters {
  search: string;
  rarity: string;
  type: string;
  tradable: boolean | null;
  marketable: boolean | null;
}

export interface SteamInventoryProps {
  steamId: string;
  className?: string;
} 