'use client'

import { useState } from 'react';
import { useTradeUrl } from '@/hooks/useTradeUrl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { TradeUrlFormProps } from '@/types';
import { ExternalLink } from 'lucide-react';

export default function TradeUrlForm({ walletAddress, onSuccess, onError }: TradeUrlFormProps) {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  const { isLoading, error, saveTradeUrl, clearError } = useTradeUrl(walletAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputUrl.trim()) {
      if (onError) onError('Debes proporcionar tu URL de intercambio de Steam');
      return;
    }

    const success = await saveTradeUrl(inputUrl.trim());
    
    if (success) {
      setShowSuccess(true);
      if (onSuccess) {
        onSuccess({
          wallet_address: walletAddress,
          trade_url: inputUrl.trim(),
        });
      }
    } else if (error && onError) {
      onError(error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    if (error) {
      clearError();
    }
    if (showSuccess) {
      setShowSuccess(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-medium">URL de Intercambio</h2>
          <Badge variant="secondary">
            Configurada
          </Badge>
        </div>
        
        <Alert variant="default">
          <AlertTitle>Guardado exitosamente</AlertTitle>
          <AlertDescription>
            Tu URL de intercambio ha sido configurada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-medium mb-6">URL de Intercambio</h2>
      
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tradeUrl">Steam Trade URL</Label>
            <Input
              id="tradeUrl"
              type="url"
              value={inputUrl}
              onChange={handleInputChange}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
              disabled={isLoading}
              required
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
            className="w-full mb-4"
            onClick={() => window.open('https://steamcommunity.com/my/tradeoffers/privacy#trade_offer_access_url', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Obtener Trade URL
          </Button>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !inputUrl.trim()}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-3" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
} 