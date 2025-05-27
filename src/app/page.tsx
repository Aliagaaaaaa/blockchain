'use client'

import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletAddress } from '@/components/WalletAddress';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import SteamLinkForm from '@/components/SteamLinkForm';
import TradeUrlForm from '@/components/TradeUrlForm';
import { useOnboarding } from '@/hooks/useOnboarding';
import { ONBOARDING_STEPS } from '@/constants/onboarding';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import type { SteamUser, SteamLinkData, TradeUrlData } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FaSteam } from "react-icons/fa6";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const {
    currentStep,
    isWalletConnected,
    steamData,
    handleSteamSuccess,
    handleSteamError,
    handleTradeUrlSuccess,
    handleTradeUrlError,
    error,
    clearError,
    isLoading,
  } = useOnboarding(address, isConnected);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (currentStep === ONBOARDING_STEPS.COMPLETE) {
    return <DashboardView steamData={steamData || null} walletAddress={address} disconnect={disconnect} />;
  }

  const handleGoToDashboard = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.CONNECT_WALLET:
        return <ConnectWalletStep />;
      
      case ONBOARDING_STEPS.LINK_STEAM:
        return (
          <LinkSteamStep
            walletAddress={address || ''}
            onSuccess={handleSteamSuccess}
            onError={handleSteamError}
          />
        );
      
      case ONBOARDING_STEPS.SET_TRADE_URL:
        return (
          <SetTradeUrlStep
            walletAddress={address || ''}
            steamData={steamData || null}
            onSuccess={handleTradeUrlSuccess}
            onError={handleTradeUrlError}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">CS2 Skins Onchain</h1>
          <p className="text-xl text-muted-foreground">
            Conecta tu wallet y Steam para comenzar
          </p>
        </div>

        {isWalletConnected && currentStep !== ONBOARDING_STEPS.CONNECT_WALLET && (
          <OnboardingProgress currentStep={currentStep} />
        )}

        {error && (
          <div className="max-w-md mx-auto mb-6">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <div>
                  <p>{error}</p>
                  <button
                    onClick={clearError}
                    className="mt-2 text-sm underline"
                  >
                    Cerrar
                  </button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {renderStepContent()}
          </div>
        </div>

        {isWalletConnected && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => disconnect()}
            >
              Desconectar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface DashboardViewProps {
  steamData: SteamUser | null;
  walletAddress: string | undefined;
  disconnect: () => void;
}

function DashboardView({ steamData, walletAddress, disconnect }: DashboardViewProps) {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold">Dashboard</CardTitle>
                <CardDescription>CS2 Skins Onchain</CardDescription>
              </div>
              <div className="text-right">
                <Button 
                  variant="outline"
                  onClick={disconnect}
                >
                  Desconectar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Wallet</CardTitle>
                <Badge variant="secondary">
                  Conectada
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <WalletAddress address={walletAddress || ''} />
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                  <span className="text-sm font-medium">En línea</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Steam</CardTitle>
                <Badge variant="secondary">
                  {steamData ? 'Vinculada' : 'No vinculada'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {steamData ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={steamData.steam_avatar} 
                        alt={`Avatar de ${steamData.steam_username}`}
                      />
                      <AvatarFallback>
                        {steamData.steam_username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{steamData.steam_username}</p>
                      <p className="text-sm text-muted-foreground">{steamData.steam_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Vinculada</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No disponible</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventario de Skins</CardTitle>
            <CardDescription>Gestiona tus skins de CS2</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Próximamente</h3>
              <p className="text-muted-foreground">
                Aquí podrás ver y gestionar tus skins de CS2
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConnectWalletStep() {
  return (
    <Card className="text-center">
      <CardContent className="p-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Conectar Wallet</h2>
        </div>

        <div className="flex justify-center">
          <appkit-connect-button />
        </div>
      </CardContent>
    </Card>
  );
}

interface LinkSteamStepProps {
  walletAddress: string;
  onSuccess: (data: SteamLinkData) => void;
  onError: (error: string) => void;
}

function LinkSteamStep({ walletAddress, onSuccess, onError }: LinkSteamStepProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSteam className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            <WalletAddress address={walletAddress} />
          </p>
        </div>

        <SteamLinkForm
          walletAddress={walletAddress}
          onSuccess={onSuccess}
          onError={onError}
        />
      </CardContent>
    </Card>
  );
}

interface SetTradeUrlStepProps {
  walletAddress: string;
  steamData: SteamUser | null;
  onSuccess: (data: TradeUrlData) => void;
  onError: (error: string) => void;
}

function SetTradeUrlStep({ walletAddress, steamData, onSuccess, onError }: SetTradeUrlStepProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          {steamData && (
            <div className="mb-4 flex justify-center">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={steamData.steam_avatar} 
                    alt={`Avatar de ${steamData.steam_username}`}
                  />
                  <AvatarFallback>
                    {steamData.steam_username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{steamData.steam_username}</p>
              </div>
            </div>
          )}
        </div>

        <TradeUrlForm
          walletAddress={walletAddress}
          onSuccess={onSuccess}
          onError={onError}
        />
      </CardContent>
    </Card>
  );
}
