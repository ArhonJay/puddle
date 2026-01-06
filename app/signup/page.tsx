'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LoginForm, OAuthButtons } from '@/components/auth';
import { MainLayout } from '@/components/layout';

export default function SignupPage() {
  return (
    <MainLayout>
      <div className="fixed inset-0 top-[var(--navbar-height)] bg-gradient-to-br from-[#0a1628] via-[#0f1d2b] to-[#1e3a52] flex items-center justify-center p-4 overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/60 rounded-sm animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-blue-300/50 rounded-sm animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-cyan-400/60 rounded-sm animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-blue-400/50 rounded-sm animate-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-white/50 rounded-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-cyan-300/40 rounded-sm animate-pulse" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-60 left-1/2 w-2 h-2 bg-blue-500/40 rounded-sm animate-pulse" style={{ animationDelay: '1.2s' }} />
        </div>

        <div className="w-full relative z-10" style={{ maxWidth: '500px' }}>
          {/* Signup Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white rounded-2xl p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="font-[family-name:var(--font-pixel)] text-2xl text-gray-900 mb-2" style={{ imageRendering: 'pixelated' }}>
                Create your account
              </h1>
              <p className="text-gray-600 text-sm">
                Start your saving journey today
              </p>
            </div>

            {/* Email Signup Form */}
            <LoginForm mode="signup" />

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-700">
                Already have an account?{' '}
                <Link href="/login" className="text-[#3b9dff] hover:text-[#2a8ae8] font-semibold transition-colors">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
