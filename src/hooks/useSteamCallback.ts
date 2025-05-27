import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '@/utils/format';
import type { SteamCallbackParams, SteamLinkData } from '@/types';

interface UseSteamCallbackReturn {
  isSuccess: boolean;
  isError: boolean;
  steamData: SteamLinkData | null;
  error: string | null;
  clearCallback: () => void;
}

/**
 * Custom hook for handling Steam authentication callback
 * @param onSuccess - Callback function when Steam link is successful
 * @param onError - Callback function when Steam link fails
 * @returns Object containing callback state and actions
 */
export const useSteamCallback = (
  onSuccess?: (data: SteamLinkData) => void,
  onError?: (error: string) => void
): UseSteamCallbackReturn => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [steamData, setSteamData] = useState<SteamLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearCallback = useCallback(() => {
    setIsSuccess(false);
    setIsError(false);
    setSteamData(null);
    setError(null);
  }, []);

  const clearUrlParams = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params: SteamCallbackParams = {
      error: url.searchParams.get('error') || undefined,
      message: url.searchParams.get('message') || undefined,
      steam_link_success: url.searchParams.get('steam_link_success') || undefined,
      data: url.searchParams.get('data') || undefined,
    };

    // Handle error case
    if (params.error) {
      const errorMessage = params.message || `Error en la vinculación: ${params.error}`;
      setError(errorMessage);
      setIsError(true);
      console.error('Error en vinculación Steam:', params.error, params.message);
      
      if (onError) {
        onError(errorMessage);
      }
      
      clearUrlParams();
      return;
    }

    // Handle success case
    if (params.steam_link_success === 'true' && params.data) {
      try {
        const linkData = safeJsonParse<SteamLinkData>(decodeURIComponent(params.data));
        
        if (linkData) {
          console.log('Vinculación Steam exitosa:', linkData);
          setSteamData(linkData);
          setIsSuccess(true);
          setError(null);
          
          if (onSuccess) {
            onSuccess(linkData);
          }
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error al procesar datos de vinculación:', err);
        const errorMessage = 'Error al procesar los datos de vinculación';
        setError(errorMessage);
        setIsError(true);
        
        if (onError) {
          onError(errorMessage);
        }
      }
      
      clearUrlParams();
    }
  }, [onSuccess, onError, clearUrlParams]);

  return {
    isSuccess,
    isError,
    steamData,
    error,
    clearCallback,
  };
}; 