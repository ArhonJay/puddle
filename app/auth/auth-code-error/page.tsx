'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <MainLayout>
      <div className="fixed inset-0 top-[var(--navbar-height)] bg-gradient-to-br from-[#0a1628] via-[#0f1d2b] to-[#1e3a52] flex items-center justify-center p-4 overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-red-400/60 rounded-sm animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-red-300/50 rounded-sm animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-orange-400/60 rounded-sm animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full relative z-10" style={{ maxWidth: '500px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white rounded-2xl p-8 shadow-2xl text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-gray-900 mb-4" style={{ imageRendering: 'pixelated' }}>
              Authentication Error
            </h1>

            <p className="text-gray-600 mb-6">
              Something went wrong during authentication. This could be due to an expired link or a technical issue.
            </p>

            <div className="space-y-4">
              <Link href="/login" className="block">
                <Button className="w-full h-12 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white font-[family-name:var(--font-pixel)] text-sm rounded-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all">
                  Try Again
                </Button>
              </Link>
              
              <Link href="/" className="block">
                <Button variant="outline" className="w-full h-12 font-[family-name:var(--font-pixel)] text-sm rounded-lg border-2 border-gray-300">
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
