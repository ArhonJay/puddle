/**
 * Client-side Providers Wrapper
 * 
 * Wraps the app with all necessary context providers
 */

'use client';

import { WalletProvider } from '@/contexts/WalletContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  );
}
