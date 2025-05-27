'use client'

import { useState } from 'react';
import { useSteamCallback } from '@/hooks/useSteamCallback';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { API_ENDPOINTS } from '@/constants/api';
import type { SteamLinkFormProps } from '@/types';
import { FaSteam } from "react-icons/fa6";

export default function SteamLinkForm({ walletAddress, onSuccess, onError }: SteamLinkFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  
  const { isSuccess, isError, steamData, error, clearCallback } = useSteamCallback(
    onSuccess,
    onError
  );

  const handleSteamLogin = () => {
    if (!walletAddress) {
      if (onError) onError('Debes conectar tu wallet primero');
      return;
    }
    
    setLoading(true);
    
    const steamAuthUrl = `${API_ENDPOINTS.STEAM_AUTH}?wallet=${encodeURIComponent(walletAddress)}`;
    console.log('Redirecting to Steam auth:', steamAuthUrl);
    window.location.href = steamAuthUrl;
  };

  const handleTryAgain = () => {
    clearCallback();
    setLoading(false);
  };

  if (isSuccess && steamData) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-medium">Steam Vinculado</h2>
          <Badge variant="secondary">
            Conectado
          </Badge>
        </div>
        
        <Card>
          <CardContent className="p-4">
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
                <p className="text-sm text-muted-foreground">ID: {steamData.steam_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-medium mb-6">Vincular Steam</h2>
      
      <div className="space-y-4">
        {(isError || error) && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <div>
                <p>{error}</p>
                <button
                  onClick={handleTryAgain}
                  className="mt-2 text-sm underline"
                >
                  Intentar de nuevo
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Button
          onClick={handleSteamLogin}
          className="w-full"
          disabled={loading || !walletAddress}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-3" />
              Conectando...
            </>
          ) : (
            <>
              <FaSteam className="w-5 h-5 mr-2" />
              Conectar con Steam
            </>
          )}
        </Button>
        
        {!walletAddress && (
          <Alert variant="default">
            <AlertTitle>Wallet requerida</AlertTitle>
            <AlertDescription>
              Conecta tu wallet primero
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
} 