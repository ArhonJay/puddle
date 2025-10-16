'use client';

import React, { ReactNode, useState } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { WalletProvider } from '@/contexts/walletContext';

interface PuddleLayoutProps {
  children: ReactNode;
}

export function PuddleLayout({ children }: PuddleLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <WalletProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar 
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Main content with responsive margins */}
        <main className="pt-14 lg:ml-[20%] md:ml-[25%] ml-0 transition-all duration-300">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </WalletProvider>
  );
}
