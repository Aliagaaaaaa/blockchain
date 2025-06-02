import { useState, useEffect, useCallback } from 'react';

export interface BlockchainStoredItem {
  id: string;
  assetid: string;
  name: string;
  market_name: string;
  icon_url: string;
  rarity: string;
  type: string;
  color: string;
  storedAt: Date;
  value?: number; // Valor estimado en USD
}

export interface UseBlockchainItemsReturn {
  items: BlockchainStoredItem[];
  isLoading: boolean;
  error: string | null;
  totalValue: number;
  itemCount: number;
  loadItems: () => Promise<void>;
  clearError: () => void;
  refreshItems: () => Promise<void>;
}

// Mock data para desarrollo - simulando items en blockchain
const MOCK_BLOCKCHAIN_ITEMS: BlockchainStoredItem[] = [
  {
    id: 'bc_001',
    assetid: '123456789',
    name: 'AK-47 | Redline',
    market_name: 'AK-47 | Redline (Field-Tested)',
    icon_url: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV09-5lpKKqPrxN7LEmyUJvJwl3e2Q8dSt2wPi-EZvZzv6I4fAcVQ-aFnQ8wK2yejr1sC1ot2XnjhKbTI',
    rarity: 'Clasificado',
    type: 'Rifle de asalto',
    color: '#d32ce6',
    storedAt: new Date('2024-01-15'),
    value: 45.20
  },
  {
    id: 'bc_002',
    assetid: '987654321',
    name: 'Glock-18 | Water Elemental',
    market_name: 'Glock-18 | Water Elemental (Minimal Wear)',
    icon_url: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6OZqPrxZzgbPrYfi1WTkomMmOXmcLzXk28FvscghWzA9dX13gO3rUE4NWH2IISWdAU4Y1DZ_1Hsx7jphJG8ot2XnjgA8y2m',
    rarity: 'Restringida',
    type: 'Pistola',
    color: '#8847ff',
    storedAt: new Date('2024-01-10'),
    value: 12.80
  },
  {
    id: 'bc_003',
    assetid: '456789123',
    name: 'AWP | Lightning Strike',
    market_name: 'AWP | Lightning Strike (Factory New)',
    icon_url: '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6OZqPrxZzgbPrYfi1XSk4_MkdP-J6fLlmVQ65Vy2-qTrNz0jlGx-hE4NmH0cdTEcwVtNA7Z_VXoyOzt05C17s-azzpr7HQ8pSGKABiPsQY',
    rarity: 'Encubierto',
    type: 'Rifle de francotirador',
    color: '#eb4b4b',
    storedAt: new Date('2024-01-05'),
    value: 89.50
  }
];

export function useBlockchainItems(): UseBlockchainItemsReturn {
  const [items, setItems] = useState<BlockchainStoredItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular llamada a la API de blockchain
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular posibilidad de no tener items (comentar para probar estado vacío)
      const hasItems = Math.random() > 0.3; // 70% probabilidad de tener items
      
      if (hasItems) {
        setItems(MOCK_BLOCKCHAIN_ITEMS);
        console.log('Items cargados desde blockchain:', MOCK_BLOCKCHAIN_ITEMS.length);
      } else {
        setItems([]);
        console.log('No se encontraron items en blockchain');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar items de blockchain: ${errorMessage}`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshItems = useCallback(async () => {
    await loadItems();
  }, [loadItems]);

  // Calcular valores derivados
  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);
  const itemCount = items.length;

  // Cargar items al montar el componente
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    isLoading,
    error,
    totalValue,
    itemCount,
    loadItems,
    clearError,
    refreshItems,
  };
} 