'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  showScrollHint?: boolean;
}

/**
 * Hero Section Component
 * Main hero content overlaid on the pixel scene
 */
export function HeroSection({ showScrollHint = true }: HeroSectionProps) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-var(--navbar-height))] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-4xl"
      >

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-[family-name:var(--font-pixel)] text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight"
          style={{ imageRendering: 'pixelated' }}
        >
          <span className="relative inline-block" style={{
            color: '#87CEEB',
            textShadow: `
              -3px -3px 0 #1E3A8A,
              3px -3px 0 #1E3A8A,
              -3px 3px 0 #1E3A8A,
              3px 3px 0 #1E3A8A,
              -3px 0 0 #1E3A8A,
              3px 0 0 #1E3A8A,
              0 -3px 0 #1E3A8A,
              0 3px 0 #1E3A8A,
              -4px -4px 0 #0F172A,
              4px -4px 0 #0F172A,
              -4px 4px 0 #0F172A,
              4px 4px 0 #0F172A
            `
          }}>
            Not Investing
          </span>
          <br />
          <span className="relative inline-block mt-2" style={{
            color: '#60A5FA',
            textShadow: `
              -3px -3px 0 #1E3A8A,
              3px -3px 0 #1E3A8A,
              -3px 3px 0 #1E3A8A,
              3px 3px 0 #1E3A8A,
              -3px 0 0 #1E3A8A,
              3px 0 0 #1E3A8A,
              0 -3px 0 #1E3A8A,
              0 3px 0 #1E3A8A,
              -4px -4px 0 #0F172A,
              4px -4px 0 #0F172A,
              -4px 4px 0 #0F172A,
              4px 4px 0 #0F172A
            `
          }}>
            Just Puddling
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-[family-name:var(--font-pixel)] text-sm md:text-base text-white/90 mb-8 max-w-2xl mx-auto leading-loose"
        >
          A Web2 consumer facing simple savings dApp.{' '}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/login">
            <Button className="btn-pixel font-[family-name:var(--font-pixel)] text-sm px-8 py-6 shadow-2xl hover:shadow-xl group">
              Get started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

        </motion.div>

      </motion.div>

      {/* Scroll Hint */}
      {showScrollHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-white/60 text-sm flex flex-col items-center gap-2"
          >
            <span>Scroll to explore</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
