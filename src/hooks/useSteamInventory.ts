import { useState, useEffect, useCallback } from 'react';
import { getSteamInventory, processInventoryItems } from '@/services/inventoryService';
import type { SteamInventoryItem, InventoryFilters } from '@/types';

export interface UseSteamInventoryReturn {
  items: SteamInventoryItem[];
  filteredItems: SteamInventoryItem[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  filters: InventoryFilters;
  loadInventory: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
}

const defaultFilters: InventoryFilters = {
  search: '',
  rarity: '',
  type: '',
  tradable: null,
  marketable: null,
};

export function useSteamInventory(steamId: string): UseSteamInventoryReturn {
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [lastAssetId, setLastAssetId] = useState<string | undefined>();
  const [filters, setFiltersState] = useState<InventoryFilters>(defaultFilters);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const setFilters = useCallback((newFilters: Partial<InventoryFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const loadInventory = useCallback(async () => {
    if (!steamId) {
      setError('Steam ID es requerido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSteamInventory(steamId);
      
      if (!response.success) {
        throw new Error(response.error || 'Error al cargar el inventario');
      }

      const processedItems = processInventoryItems(response);
      setItems(processedItems);
      setTotalCount(response.total_inventory_count || 0);
      setHasMore(!!response.more_items);
      setLastAssetId(response.last_assetid);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  }, [steamId]);

  const loadMore = useCallback(async () => {
    if (!steamId || !hasMore || !lastAssetId || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getSteamInventory(steamId, lastAssetId);
      
      if (!response.success) {
        throw new Error(response.error || 'Error al cargar más elementos');
      }

      const processedItems = processInventoryItems(response);
      setItems(prev => [...prev, ...processedItems]);
      setHasMore(!!response.more_items);
      setLastAssetId(response.last_assetid);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error loading more items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [steamId, hasMore, lastAssetId, isLoading]);

  const refresh = useCallback(async () => {
    setItems([]);
    setLastAssetId(undefined);
    setHasMore(false);
    await loadInventory();
  }, [loadInventory]);

  // Filter items based on current filters
  const filteredItems = items.filter(item => {
    // Search filter
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.market_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Rarity filter (based on name color or tags)
    if (filters.rarity) {
      const rarityTag = item.tags?.find(tag => tag.category === 'Rarity');
      if (!rarityTag || rarityTag.internal_name !== filters.rarity) {
        return false;
      }
    }

    // Type filter
    if (filters.type) {
      const typeTag = item.tags?.find(tag => tag.category === 'Type');
      if (!typeTag || typeTag.internal_name !== filters.type) {
        return false;
      }
    }

    // Tradable filter
    if (filters.tradable !== null) {
      if (filters.tradable && item.tradable !== 1) {
        return false;
      }
      if (!filters.tradable && item.tradable === 1) {
        return false;
      }
    }

    // Marketable filter
    if (filters.marketable !== null) {
      if (filters.marketable && item.marketable !== 1) {
        return false;
      }
      if (!filters.marketable && item.marketable === 1) {
        return false;
      }
    }

    return true;
  });

  // Load inventory on mount or when steamId changes
  useEffect(() => {
    if (steamId) {
      loadInventory();
    }
  }, [steamId, loadInventory]);

  return {
    items,
    filteredItems,
    isLoading,
    error,
    totalCount,
    hasMore,
    filters,
    loadInventory,
    loadMore,
    setFilters,
    clearError,
    refresh,
  };
} 