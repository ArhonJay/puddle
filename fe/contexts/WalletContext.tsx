/**
 * Wallet Connection Context
 * 
 * Manages wallet authentication state and provides methods for
 * connecting/disconnecting wallets (Leather, Email, Google)
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, AppConfig } from '@stacks/connect';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type WalletType = 'leather' | 'email' | 'google' | null;

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: WalletType;
  userSession: any | null;
}
export interface WalletContextType extends WalletState {
  connectLeatherWallet: () => void;
  connectWithEmail: (email: string, password: string) => Promise<void>;
  connectWithGoogle: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

// ============================================
// CONTEXT SETUP
// ============================================

const WalletContext = createContext<WalletContextType | undefined>(undefined);
// WALLET PROVIDER
// ============================================

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
    userSession: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [userSession] = useState(() => new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data']) }));

  // Check for existing session on mount
  useEffect(() => {
    const checkConnection = () => {
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        const address = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
        setWalletState({
          isConnected: true,
          address: address || null,
          walletType: 'leather',
          userSession: userSession,
        });
      }
      setIsLoading(false);
    };
    checkConnection();
  }, [userSession]);

  /**
   * Connect with Leather Wallet (Stacks wallet)
   */
  const connectLeatherWallet = async () => {
    try {
      // Use authenticate for v8 API
      const { authenticate } = await import('@stacks/connect');
      
      await authenticate({
        appDetails: {
          name: 'Puddle',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (payload) => {
          const userData = userSession.loadUserData();
          const address = userData?.profile?.stxAddress?.testnet || 
                         userData?.profile?.stxAddress?.mainnet ||
                         payload.authResponse;
          setWalletState({
            isConnected: true,
            address: address || null,
            walletType: 'leather',
            userSession: userSession,
          });
        },
        onCancel: () => {
          console.log('Wallet connection cancelled');
        },
        userSession: userSession,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  /**
   * Connect with Email/Password
   * Note: This is a placeholder for future implementation
   */
  const connectWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // TODO: Implement email/password authentication
      
      // Placeholder implementation
      console.log('Email authentication not yet implemented');
      alert('Email authentication coming soon! Please use Leather Wallet for now.');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Email authentication error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Connect with Google OAuth
   * Note: This would typically integrate with Firebase or Auth0
   */
  const connectWithGoogle = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement Google OAuth authentication
      
      // Placeholder implementation
      console.log('Google authentication not yet implemented');
      alert('Google authentication coming soon! Please use Leather Wallet for now.');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Google authentication error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnect = () => {
    if (userSession) {
      userSession.signUserOut();
    }
    setWalletState({
      isConnected: false,
      address: null,
      walletType: null,
      userSession: null,
    });
  };

  return (
    <WalletContext.Provider
      value={{
        ...walletState,
        connectLeatherWallet,
        connectWithEmail,
        connectWithGoogle,
        disconnect,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Hook to access wallet context
 * @returns Wallet context with connection methods and state
 */
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format wallet address for display (truncated)
 * @param address - Full wallet address
 * @returns Truncated address (e.g., ST1HW...7501S77A)
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-8)}`;
}

/**
 * Copy address to clipboard
 * @param address - Address to copy
 */
export async function copyAddress(address: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(address);
  } catch (error) {
    console.error('Failed to copy address:', error);
  }
}
