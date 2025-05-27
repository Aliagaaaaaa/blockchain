import { useState, useCallback, useEffect } from 'react';
import { isValidTradeUrl } from '@/utils/validation';
import { API_ENDPOINTS } from '@/constants/api';
import type { UseTradeUrlReturn, TradeUrlResponse } from '@/types';

/**
 * Custom hook for managing trade URL functionality
 * @param walletAddress - The wallet address to save trade URL for
 * @returns Object containing trade URL state and actions
 */
export const useTradeUrl = (walletAddress?: string): UseTradeUrlReturn => {
  const [tradeUrl, setTradeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTradeUrl = useCallback(async (): Promise<void> => {
    if (!walletAddress) {
      setTradeUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.TRADE_URL}?wallet_address=${encodeURIComponent(walletAddress)}`);

      if (!response.ok) {
        if (response.status === 404) {
          setTradeUrl(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TradeUrlResponse = await response.json();

      if (data.success && data.data?.trade_url) {
        setTradeUrl(data.data.trade_url);
      } else {
        setTradeUrl(null);
      }
    } catch (err) {
      console.error('Error loading trade URL:', err);
      setTradeUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Load trade URL when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      loadTradeUrl();
    } else {
      setTradeUrl(null);
      setError(null);
    }
  }, [walletAddress, loadTradeUrl]);

  const saveTradeUrl = useCallback(async (url: string): Promise<boolean> => {
    if (!walletAddress) {
      setError('Debes conectar tu wallet primero');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!isValidTradeUrl(url)) {
        setError('URL de intercambio de Steam inválida');
        return false;
      }

      const response = await fetch(API_ENDPOINTS.TRADE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          trade_url: url,
        }),
      });

      const result: TradeUrlResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al guardar la URL de intercambio. Por favor intenta de nuevo.');
      }

      setTradeUrl(url);
      await loadTradeUrl();
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar la URL de intercambio. Por favor intenta de nuevo.';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, loadTradeUrl]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    tradeUrl,
    isLoading,
    error,
    saveTradeUrl,
    clearError,
    loadTradeUrl,
  };
}; 