/**
 * Not Connected Component
 * 
 * Displayed when user hasn't connected their wallet
 */

'use client';

import React, { useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { LoginModal } from '@/components/auth/loginModal';

export function NotConnected() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mb-6">
            <Wallet className="w-12 h-12 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            To view your liquidity pools, manage your investments, and earn BTC-dominated yields,
            please connect your wallet.
          </p>

          {/* Connect Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
          >
            <span>Connect Wallet</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
