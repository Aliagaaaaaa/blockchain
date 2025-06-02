'use client';

import React from 'react';
import { RefreshCw, Package, AlertCircle, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { useBlockchainItems } from '@/hooks/useBlockchainItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlockchainStoredItem } from '@/hooks/useBlockchainItems';
import { cn } from '@/lib/utils';

// Componente para item individual en blockchain
const BlockchainItem: React.FC<{ item: BlockchainStoredItem }> = ({ item }) => {
  const formattedDate = item.storedAt.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="group p-3 rounded-lg border hover:shadow-md transition-all duration-200 bg-white hover:bg-gray-50">
      <div className="flex items-start gap-3">
        {/* Item Image */}
        <div className="relative flex-shrink-0">
         
          {/* Rarity indicator */}
          <div 
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ backgroundColor: item.color }}
          />
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h4 
            className="font-medium text-sm leading-tight line-clamp-2 mb-1"
            style={{ color: item.color }}
          >
            {item.market_name || item.name}
          </h4>
          
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="text-xs" style={{ borderColor: item.color, color: item.color }}>
              {item.rarity}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {item.type}
            </Badge>
          </div>

          {/* Value and Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {item.value && (
              <span className="flex items-center gap-1 font-medium text-green-600">
                <DollarSign className="h-3 w-3" />
                ${item.value.toFixed(2)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton para items en loading
const BlockchainItemSkeleton: React.FC = () => (
  <div className="p-3 rounded-lg border">
    <div className="flex items-start gap-3">
      <Skeleton className="w-12 h-12 rounded" />
      <div className="flex-1">
        <Skeleton className="h-4 mb-2" />
        <div className="flex gap-1 mb-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  </div>
);

// Estado vacío
const EmptyState: React.FC = () => (
  <div className="text-center py-8 px-4">
    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-700 mb-2">
      Sin Items en Blockchain
    </h3>
    <p className="text-sm text-gray-500 mb-4">
      Aún no tienes objetos almacenados en la blockchain. 
      Agrega items desde tu inventario de Steam para empezar.
    </p>
    <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
      <ExternalLink className="h-3 w-3" />
      Los items se almacenan de forma segura en la blockchain
    </div>
  </div>
);

// Componente principal del panel
export interface BlockchainPanelProps {
  className?: string;
}

export const BlockchainPanel: React.FC<BlockchainPanelProps> = ({ className }) => {
  const {
    items,
    isLoading,
    error,
    totalValue,
    itemCount,
    clearError,
    refreshItems,
  } = useBlockchainItems();

  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-blue-600" />
            Blockchain Storage
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshItems}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{itemCount}</div>
              <div className="text-xs text-blue-600">Items</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">
                ${totalValue.toFixed(0)}
              </div>
              <div className="text-xs text-green-600">Valor Total</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="ml-2 h-6"
              >
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content with custom scroll */}
        <div className="max-h-[400px] overflow-y-auto pr-2">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <BlockchainItemSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && items.length === 0 && <EmptyState />}

          {/* Items List */}
          {!isLoading && !error && items.length > 0 && (
            <div className="space-y-3">
              {items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <BlockchainItem item={item} />
                  {index < items.length - 1 && (
                    <div className="border-t border-gray-100 my-2" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {!isLoading && !error && items.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Almacenamiento seguro</span>
              <span className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Blockchain
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainPanel; 