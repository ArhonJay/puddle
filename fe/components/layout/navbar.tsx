'use client';

import React, { useState } from 'react';
import { useWallet, formatAddress } from '@/contexts/walletContext';
import { LoginModal } from '@/components/auth/loginModal';
import { LogOut, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onMenuClick?: () => void;
  isMobileSidebarOpen?: boolean;
}

export function Navbar({ onMenuClick, isMobileSidebarOpen }: NavbarProps = {}) {
  const { isConnected, address, disconnect } = useWallet();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <nav className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Mobile Menu + Logo/Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileSidebarOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
              Puddle
            </h1>
          </div>

          {/* Right: Login/User */}
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className={cn(
                  "px-4 sm:px-6 py-2 rounded-md font-medium text-white text-sm sm:text-base",
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
                    "px-3 sm:px-4 py-2 rounded-full",
                    "bg-blue-50 hover:bg-blue-100",
                    "border border-blue-200",
                    "transition-all duration-200",
                    "flex items-center gap-2"
                  )}
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 hidden xs:inline">
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
                        // Refresh page to show disconnected state
                        setTimeout(() => {
                          window.location.reload();
                        }, 300);
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
