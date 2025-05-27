import { useState, useEffect, useCallback } from 'react';
import { useSteamLink } from './useSteamLink';
import { useTradeUrl } from './useTradeUrl';
import { useSteamCallback } from './useSteamCallback';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import type { OnboardingStep, OnboardingState, SteamLinkData, TradeUrlData } from '@/types';

interface UseOnboardingReturn extends OnboardingState {
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  handleSteamSuccess: (data: SteamLinkData) => void;
  handleSteamError: (error: string) => void;
  handleTradeUrlSuccess: (data: TradeUrlData) => void;
  handleTradeUrlError: (error: string) => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for managing the complete onboarding flow
 * @param walletAddress - The connected wallet address
 * @param isWalletConnected - Whether the wallet is connected
 * @returns Object containing onboarding state and actions
 */
export const useOnboarding = (
  walletAddress?: string,
  isWalletConnected: boolean = false
): UseOnboardingReturn => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(ONBOARDING_STEPS.CONNECT_WALLET);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);

  const {
    steamLinked,
    steamData,
    isLoading: steamLoading,
    error: steamError,
    checkSteamLink,
    clearError: clearSteamError,
  } = useSteamLink(walletAddress);

  const {
    tradeUrl,
    isLoading: tradeUrlLoading,
    error: tradeUrlError,
    clearError: clearTradeUrlError,
    loadTradeUrl,
  } = useTradeUrl(walletAddress);

  const { clearCallback } = useSteamCallback();

  // Determine if user has trade URL
  const hasTradeUrl = Boolean(tradeUrl || steamData?.trade_url);

  // Combined loading state - include initial load check
  const isLoading = (steamLoading || tradeUrlLoading) && !initialLoadComplete;

  // Combined error state
  const combinedError = error || steamError || tradeUrlError;

  // Check Steam link status when wallet connects
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      setInitialLoadComplete(false);
      checkSteamLink();
    } else {
      setInitialLoadComplete(true);
    }
  }, [isWalletConnected, walletAddress, checkSteamLink]);

  // Mark initial load as complete when data is loaded
  useEffect(() => {
    if (isWalletConnected && !steamLoading && !tradeUrlLoading) {
      setInitialLoadComplete(true);
    }
  }, [isWalletConnected, steamLoading, tradeUrlLoading]);

  // Auto-advance steps based on completion status
  useEffect(() => {
    // Only update steps after initial load is complete
    if (!initialLoadComplete) return;

    if (!isWalletConnected) {
      setCurrentStep(ONBOARDING_STEPS.CONNECT_WALLET);
    } else if (!steamLinked && currentStep === ONBOARDING_STEPS.CONNECT_WALLET) {
      setCurrentStep(ONBOARDING_STEPS.LINK_STEAM);
    } else if (steamLinked && !hasTradeUrl && currentStep !== ONBOARDING_STEPS.SET_TRADE_URL) {
      setCurrentStep(ONBOARDING_STEPS.SET_TRADE_URL);
    } else if (steamLinked && hasTradeUrl && currentStep !== ONBOARDING_STEPS.COMPLETE) {
      setCurrentStep(ONBOARDING_STEPS.COMPLETE);
    }
  }, [isWalletConnected, steamLinked, hasTradeUrl, currentStep, initialLoadComplete]);

  const nextStep = useCallback(() => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as OnboardingStep);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as OnboardingStep);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  const handleSteamSuccess = useCallback((data: SteamLinkData) => {
    console.log('Steam linked successfully:', data);
    clearCallback();
    // The useEffect will automatically advance to the next step
  }, [clearCallback]);

  const handleSteamError = useCallback((error: string) => {
    setError(error);
    console.error('Steam linking failed:', error);
  }, []);

  const handleTradeUrlSuccess = useCallback(async (data: TradeUrlData) => {
    console.log('Trade URL saved successfully:', data);
    // Reload trade URL to update the state
    await loadTradeUrl();
    // The useEffect will automatically advance to the complete step
  }, [loadTradeUrl]);

  const handleTradeUrlError = useCallback((error: string) => {
    setError(error);
    console.error('Trade URL save failed:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    clearSteamError();
    clearTradeUrlError();
  }, [clearSteamError, clearTradeUrlError]);

  return {
    currentStep,
    isWalletConnected,
    isSteamLinked: steamLinked,
    hasTradeUrl,
    steamData,
    nextStep,
    previousStep,
    goToStep,
    handleSteamSuccess,
    handleSteamError,
    handleTradeUrlSuccess,
    handleTradeUrlError,
    isLoading,
    error: combinedError,
    clearError,
  };
}; 