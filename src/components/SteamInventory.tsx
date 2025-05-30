'use client';

import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Package, AlertCircle } from 'lucide-react';
import { useSteamInventory } from '@/hooks/useSteamInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SteamInventoryProps, SteamInventoryItem } from '@/types';
import { cn } from '@/lib/utils';

// Utility function to get rarity color
const getRarityColor = (item: SteamInventoryItem): string => {
  if (item.name_color) {
    return `#${item.name_color}`;
  }
  
  const rarityTag = item.tags?.find(tag => tag.category === 'Rarity');
  if (!rarityTag) return '#b0b0b0';
  
  const rarityColors: Record<string, string> = {
    'rarity_common': '#b0b0b0',
    'rarity_uncommon': '#5e98d9',
    'rarity_rare': '#4b69ff',
    'rarity_mythical': '#8847ff',
    'rarity_legendary': '#d32ce6',
    'rarity_ancient': '#eb4b4b',
    'rarity_immortal': '#e4ae39',
  };
  
  return rarityColors[rarityTag.internal_name] || '#b0b0b0';
};

// Utility function to get item type
const getItemType = (item: SteamInventoryItem): string => {
  const typeTag = item.tags?.find(tag => tag.category === 'Type');
  return typeTag?.localized_tag_name || item.type || 'Desconocido';
};

// Utility function to get item rarity
const getItemRarity = (item: SteamInventoryItem): string => {
  const rarityTag = item.tags?.find(tag => tag.category === 'Rarity');
  return rarityTag?.localized_tag_name || 'Común';
};

// Component for individual inventory item
const InventoryItem: React.FC<{ item: SteamInventoryItem }> = ({ item }) => {
  const rarityColor = getRarityColor(item);
  const itemType = getItemType(item);
  const itemRarity = getItemRarity(item);
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="relative">
          {/* Item Image */}
          <div className="aspect-square mb-3 relative overflow-hidden rounded-lg bg-gray-100">
            <img
              src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url_large || item.icon_url}`}
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            {/* Rarity border */}
            <div 
              className="absolute inset-0 border-2 rounded-lg opacity-60"
              style={{ borderColor: rarityColor }}
            />
          </div>
          
          {/* Item Info */}
          <div className="space-y-2">
            <h3 
              className="font-medium text-sm leading-tight line-clamp-2"
              style={{ color: rarityColor }}
            >
              {item.market_name || item.name}
            </h3>
            
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {itemType}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: rarityColor, color: rarityColor }}
              >
                {itemRarity}
              </Badge>
            </div>
            
            {/* Status badges */}
            <div className="flex gap-1">
              {item.tradable === 1 && (
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Intercambiable
                </Badge>
              )}
              {item.marketable === 1 && (
                <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                  Vendible
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading skeleton for inventory items
const InventoryItemSkeleton: React.FC = () => (
  <Card>
    <CardContent className="p-4">
      <Skeleton className="aspect-square mb-3 rounded-lg" />
      <Skeleton className="h-4 mb-2" />
      <div className="flex gap-1 mb-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Main Steam Inventory Component
export const SteamInventory: React.FC<SteamInventoryProps> = ({ 
  steamId, 
  className 
}) => {
  const {
    filteredItems,
    isLoading,
    error,
    totalCount,
    hasMore,
    filters,
    loadMore,
    setFilters,
    clearError,
    refresh,
  } = useSteamInventory(steamId);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique rarities and types for filters
  const availableRarities = Array.from(
    new Set(
      filteredItems
        .map(item => item.tags?.find(tag => tag.category === 'Rarity'))
        .filter(Boolean)
        .map(tag => tag!.internal_name)
    )
  );

  const availableTypes = Array.from(
    new Set(
      filteredItems
        .map(item => item.tags?.find(tag => tag.category === 'Type'))
        .filter(Boolean)
        .map(tag => tag!.internal_name)
    )
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="ml-2"
              >
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventario de Counter Strike 2
            {totalCount > 0 && (
              <Badge variant="secondary">
                {filteredItems.length} de {totalCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar elementos..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Rarity Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Rareza
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filtrar por rareza</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({ rarity: '' })}>
                  Todas
                </DropdownMenuItem>
                {availableRarities.map(rarity => (
                  <DropdownMenuItem 
                    key={rarity}
                    onClick={() => setFilters({ rarity })}
                  >
                    {rarity.replace('rarity_', '').replace('_', ' ')}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Tipo
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filtrar por tipo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({ type: '' })}>
                  Todos
                </DropdownMenuItem>
                {availableTypes.map(type => (
                  <DropdownMenuItem 
                    key={type}
                    onClick={() => setFilters({ type })}
                  >
                    {type.replace('_', ' ')}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'grid' | 'list')}>
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Cuadrícula</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {/* Grid View */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredItems.map((item) => (
                <InventoryItem key={item.assetid} item={item} />
              ))}
              
              {/* Loading skeletons */}
              {isLoading && Array.from({ length: 12 }).map((_, i) => (
                <InventoryItemSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            {/* List View */}
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <Card key={item.assetid} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`}
                        alt={item.name}
                        className="w-16 h-16 object-contain rounded"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <h3 
                          className="font-medium"
                          style={{ color: getRarityColor(item) }}
                        >
                          {item.market_name || item.name}
                        </h3>
                        <p className="text-sm text-gray-600">{getItemType(item)}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{getItemRarity(item)}</Badge>
                          {item.tradable === 1 && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Intercambiable
                            </Badge>
                          )}
                          {item.marketable === 1 && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              Vendible
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center mt-6">
            <Button onClick={loadMore} variant="outline">
              Cargar más elementos
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron elementos
            </h3>
            <p className="text-gray-600">
              {filters.search || filters.rarity || filters.type
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'El inventario está vacío o no se pudo cargar'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SteamInventory; 