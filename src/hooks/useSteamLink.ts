import { useState, useCallback } from 'react';
import { checkSteamLinkStatus } from '@/services/steamService';
import { formatErrorMessage } from '@/utils/format';
import type { UseSteamLinkReturn, SteamUser } from '@/types';

/**
 * Custom hook for managing Steam link functionality
 * @param walletAddress - The wallet address to check Steam link status for
 * @returns Object containing Steam link state and actions
 */
export const useSteamLink = (walletAddress?: string): UseSteamLinkReturn => {
  const [steamLinked, setSteamLinked] = useState<boolean>(false);
  const [steamData, setSteamData] = useState<SteamUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkSteamLink = useCallback(async () => {
    if (!walletAddress) {
      setSteamLinked(false);
      setSteamData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const status = await checkSteamLinkStatus(walletAddress);
      setSteamLinked(status.isLinked);
      setSteamData(status.steamData || null);
    } catch (err) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
      console.error('Error checking Steam link status:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    steamLinked,
    steamData,
    isLoading,
    error,
    checkSteamLink,
    clearError,
  };
}; 