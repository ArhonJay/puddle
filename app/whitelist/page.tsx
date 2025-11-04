'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';

export default function WhitelistPage() {
  const [email, setEmail] = useState('');
  const [wallet, setWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; wallet?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; wallet?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Wallet validation
    if (!wallet) {
      newErrors.wallet = 'Wallet address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      newErrors.wallet = 'Invalid wallet address format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Mockup - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Whitelist submission:', { email, wallet });
    
    // Reset form
    setEmail('');
    setWallet('');
    setIsLoading(false);
    
    alert('Successfully joined the whitelist! 🎉');
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 top-[var(--navbar-height)] bg-gradient-to-br from-[#0a1628] via-[#0f1d2b] to-[#1e3a52] lg:flex lg:items-center lg:justify-center lg:overflow-hidden overflow-y-auto">
        {/* Animated stars background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/60 rounded-sm animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-blue-300/50 rounded-sm animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-cyan-400/60 rounded-sm animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-blue-400/50 rounded-sm animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/50 rounded-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-300/40 rounded-sm animate-pulse" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className="w-full max-w-6xl px-4 py-6 lg:py-0 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:items-stretch"
          >
            {/* Left Side - NFT Card Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-2 lg:order-1 flex items-center justify-center"
            >
              <div className="relative w-full max-w-sm lg:max-w-none aspect-square overflow-hidden">
                <Image
                  src="/images/nft_card.png"
                  alt="Puddle NFT Card"
                  fill
                  className="object-cover"
                  style={{ imageRendering: 'pixelated' }}
                  priority
                />
              </div>
            </motion.div>

            {/* Right Side - Whitelist Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2 flex items-center"
            >
              <div className="bg-[#1e3a52] rounded-2xl p-5 lg:p-8 border-2 border-[#2a4a62] shadow-2xl w-full">
                {/* Header */}
                <div className="mb-5 lg:mb-6">
                  <h1 className="font-[family-name:var(--font-pixel)] text-xl lg:text-3xl text-white mb-2 lg:mb-3" style={{ imageRendering: 'pixelated' }}>
                    Whitelist
                  </h1>
                  <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
                    Be among the first to access exclusive Puddle NFTs! Enter your details below to secure your spot on our whitelist.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5 lg:space-y-2">
                    <label htmlFor="email" className="block font-[family-name:var(--font-pixel)] text-xs lg:text-sm text-white/90" style={{ imageRendering: 'pixelated' }}>
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className="w-full px-3 lg:px-4 py-2 lg:py-2.5 bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg text-white placeholder:text-white/40 focus:border-[#3b9dff] focus:outline-none transition-colors text-xs lg:text-sm"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 font-[family-name:var(--font-pixel)]" style={{ imageRendering: 'pixelated' }}>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Wallet Field */}
                  <div className="space-y-1.5 lg:space-y-2">
                    <label htmlFor="wallet" className="block font-[family-name:var(--font-pixel)] text-xs lg:text-sm text-white/90" style={{ imageRendering: 'pixelated' }}>
                      Wallet Address
                    </label>
                    <input
                      id="wallet"
                      type="text"
                      placeholder="0x..."
                      value={wallet}
                      onChange={(e) => {
                        setWallet(e.target.value);
                        if (errors.wallet) setErrors({ ...errors, wallet: undefined });
                      }}
                      className="w-full px-3 lg:px-4 py-2 lg:py-2.5 bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg text-white placeholder:text-white/40 focus:border-[#3b9dff] focus:outline-none transition-colors font-mono text-xs lg:text-sm"
                      disabled={isLoading}
                    />
                    {errors.wallet && (
                      <p className="text-xs text-red-400 font-[family-name:var(--font-pixel)]" style={{ imageRendering: 'pixelated' }}>
                        {errors.wallet}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#3b9dff] hover:bg-[#2a8ae8] text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg font-[family-name:var(--font-pixel)] text-xs lg:text-sm border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ imageRendering: 'pixelated' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Join Whitelist'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
