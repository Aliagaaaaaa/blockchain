'use client'

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletAddressProps {
  address: string;
  showCopy?: boolean;
  truncate?: boolean;
  className?: string;
}

export const WalletAddress = ({ 
  address, 
  showCopy = true, 
  truncate = true,
  className 
}: WalletAddressProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!showCopy) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const formatAddress = (addr: string) => {
    if (!truncate) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <span
      className={cn(
        'font-mono bg-muted px-2 py-1 rounded',
        showCopy && 'cursor-pointer hover:bg-muted/80 transition-colors',
        className
      )}
      onClick={handleCopy}
      title={showCopy ? 'Click to copy' : address}
    >
      {formatAddress(address)}
      {showCopy && (
        <span className="ml-2 inline-flex">
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </span>
      )}
    </span>
  );
}; 