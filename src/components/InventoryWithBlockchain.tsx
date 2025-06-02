'use client';

import React from 'react';
import { SteamInventory } from './SteamInventory';
import { BlockchainPanel } from './BlockchainPanel';

export interface InventoryWithBlockchainProps {
  steamId: string;
  className?: string;
}

export const InventoryWithBlockchain: React.FC<InventoryWithBlockchainProps> = ({ 
  steamId, 
  className 
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Inventario de Steam - Ocupa 3 columnas en pantallas grandes */}
      <div className="lg:col-span-3">
        <SteamInventory steamId={steamId} />
      </div>
      
      {/* Panel de Blockchain - Ocupa 1 columna en pantallas grandes, sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <BlockchainPanel />
        </div>
      </div>
    </div>
  );
};

export default InventoryWithBlockchain; 