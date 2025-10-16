'use client';

import React, { useState } from 'react';
import { X, Wallet, Mail, Chrome } from 'lucide-react';
import { useWallet } from '@/contexts/walletContext';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { connectLeatherWallet, connectWithEmail, connectWithGoogle, isLoading } = useWallet();
  const [authMethod, setAuthMethod] = useState<'select' | 'email'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await connectWithEmail(email, password);
      onClose();
      // Refresh page to show logged-in state
      window.location.reload();
    } catch (error) {
      console.error('Email login failed:', error);
    }
  };

  const handleLeatherConnect = async () => {
    try {
      await connectLeatherWallet();
      onClose();
      // Small delay to ensure state is updated before refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Leather wallet connection failed:', error);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      await connectWithGoogle();
      onClose();
      // Refresh page to show logged-in state
      window.location.reload();
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-2">
            Connect to Puddle
          </h2>
          <p className="text-blue-100 text-sm">
            Choose your preferred authentication method
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {authMethod === 'select' ? (
            <div className="space-y-3">
              {/* Leather Wallet */}
              <button
                onClick={handleLeatherConnect}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2",
                  "hover:border-blue-500 hover:bg-blue-50",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border-gray-200"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Leather Wallet</div>
                  <div className="text-sm text-gray-500">Connect with Stacks wallet</div>
                </div>
                <div className="text-blue-600 font-medium">Connect</div>
              </button>

              {/* Email & Password */}
              <button
                onClick={() => setAuthMethod('email')}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2",
                  "hover:border-blue-500 hover:bg-blue-50",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border-gray-200"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Email & Password</div>
                  <div className="text-sm text-gray-500">Use your email account</div>
                </div>
                <div className="text-blue-600 font-medium">Continue</div>
              </button>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleConnect}
                disabled={isLoading}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2",
                  "hover:border-blue-500 hover:bg-blue-50",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border-gray-200"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Chrome className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">Google Account</div>
                  <div className="text-sm text-gray-500">Sign in with Google</div>
                </div>
                <div className="text-blue-600 font-medium">Sign In</div>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Secure & Decentralized</span>
                </div>
              </div>

              {/* Info */}
              <div className="text-center text-sm text-gray-500">
                <p>
                  By connecting, you agree to Puddle's{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* Email Form */
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setAuthMethod('select')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to options
              </button>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "w-full py-3 rounded-lg font-medium text-white",
                  "bg-gradient-to-r from-blue-600 to-sky-500",
                  "hover:from-blue-700 hover:to-sky-600",
                  "transition-all duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? 'Connecting...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <a href="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
