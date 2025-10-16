'use client';

import React, { useState } from 'react';
import { useWallet, formatAddress } from '@/contexts/WalletContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { isConnected, address, disconnect } = useWallet();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <nav className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
              Puddle
            </h1>
          </div>

          {/* Right: Login/User */}
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className={cn(
                  "px-6 py-2 rounded-full font-medium text-white",
                  "bg-gradient-to-r from-blue-600 to-sky-500",
                  "hover:from-blue-700 hover:to-sky-600",
                  "transition-all duration-200",
                  "shadow-sm hover:shadow-md"
                )}
              >
                Login
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={cn(
                    "px-4 py-2 rounded-full",
                    "bg-blue-50 hover:bg-blue-100",
                    "border border-blue-200",
                    "transition-all duration-200",
                    "flex items-center gap-2"
                  )}
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(address || '')}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Connected Address</div>
                      <div className="text-sm font-mono text-gray-900 break-all">
                        {address}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        disconnect();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
