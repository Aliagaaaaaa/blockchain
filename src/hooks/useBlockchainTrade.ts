import { useState, useCallback } from 'react';
import type { SteamInventoryItem } from '@/types';

export interface BlockchainTradeItem {
  assetid: string;
  classid: string;
  instanceid: string;
  name: string;
  market_name: string;
  icon_url: string;
  rarity: string;
  type: string;
  addedAt: Date;
}

export interface UseBlockchainTradeReturn {
  selectedItems: BlockchainTradeItem[];
  isProcessing: boolean;
  error: string | null;
  addItemToBlockchain: (item: SteamInventoryItem) => Promise<void>;
  removeItemFromBlockchain: (assetid: string) => void;
  clearSelectedItems: () => void;
  generateTradeLink: () => string | null;
  isItemSelected: (assetid: string) => boolean;
  clearError: () => void;
}

// Mock bot Steam ID and trade token para desarrollo
const MOCK_BOT_STEAM_ID = '76561198123456789';
const MOCK_TRADE_TOKEN = 'AbCdEfGh';

export function useBlockchainTrade(): UseBlockchainTradeReturn {
  const [selectedItems, setSelectedItems] = useState<BlockchainTradeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isItemSelected = useCallback((assetid: string) => {
    return selectedItems.some(item => item.assetid === assetid);
  }, [selectedItems]);

  const addItemToBlockchain = useCallback(async (item: SteamInventoryItem) => {
    if (isItemSelected(item.assetid)) {
      setError('Este item ya está seleccionado');
      return;
    }

    if (!item.tradable) {
      setError('Este item no es intercambiable');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simular llamada a la API de blockchain
      await new Promise(resolve => setTimeout(resolve, 1000));

      const rarityTag = item.tags?.find(tag => tag.category === 'Rarity');
      const typeTag = item.tags?.find(tag => tag.category === 'Type');

      const blockchainItem: BlockchainTradeItem = {
        assetid: item.assetid,
        classid: item.classid,
        instanceid: item.instanceid,
        name: item.name,
        market_name: item.market_name,
        icon_url: item.icon_url,
        rarity: rarityTag?.localized_tag_name || 'Común',
        type: typeTag?.localized_tag_name || item.type || 'Desconocido',
        addedAt: new Date(),
      };

      setSelectedItems(prev => [...prev, blockchainItem]);
      
      console.log('Item agregado a blockchain:', blockchainItem);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al agregar item a blockchain: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [isItemSelected]);

  const removeItemFromBlockchain = useCallback((assetid: string) => {
    setSelectedItems(prev => prev.filter(item => item.assetid !== assetid));
  }, []);

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const generateTradeLink = useCallback(() => {
    if (selectedItems.length === 0) {
      setError('No hay items seleccionados para el trade');
      return null;
    }

    // Generar URL de trade de Steam con los items seleccionados
    const assetIds = selectedItems.map(item => item.assetid).join(',');
    const tradeUrl = `https://steamcommunity.com/tradeoffer/new/?partner=${MOCK_BOT_STEAM_ID}&token=${MOCK_TRADE_TOKEN}&assetids=${assetIds}`;
    
    console.log('Trade URL generada:', tradeUrl);
    return tradeUrl;
  }, [selectedItems]);

  return {
    selectedItems,
    isProcessing,
    error,
    addItemToBlockchain,
    removeItemFromBlockchain,
    clearSelectedItems,
    generateTradeLink,
    isItemSelected,
    clearError,
  };
} 