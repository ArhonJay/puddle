/**
 * Main Application Layout
 * 
 * Wrapper component that provides navbar, sidebar, and content area
 */

'use client';

import React, { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { WalletProvider } from '@/contexts/WalletContext';

interface PuddleLayoutProps {
  children: ReactNode;
}

export function PuddleLayout({ children }: PuddleLayoutProps) {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navbar */}
        <Navbar />

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="pt-14 transition-all duration-300" style={{ marginLeft: '20%' }}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </WalletProvider>
  );
}
