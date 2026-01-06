'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const categories = ['Popular', 'Web3 Basics', 'DeFi', 'Savings'];

const features = [
  {
    category: 'Web3 Basics',
    title: 'Wallet Fundamentals',
    description: 'Learn wallet fundamentals such as private keys, seed phrases, and secure storage with the...',
    level: 'BEGINNER',
    image: '/images/features/ench_forest.png',
    popular: true,
  },
  {
    category: 'DeFi',
    title: 'Savings Pools',
    description: 'Create your first savings pool, the building blocks of DeFi and dive into th...',
    level: 'BEGINNER',
    image: '/images/features/see.png',
    popular: true,
  },
  {
    category: 'Web3 Basics',
    title: 'Smart Contracts 101',
    description: 'Learn to use smart contracts and interact with decentralized applications with ease,...',
    level: 'BEGINNER',
    image: '/images/features/float.png',
    popular: true,
  },
  {
    category: 'Savings',
    title: 'Auto Savings',
    description: 'Set up automatic recurring savings that work while you sleep, building your wealth effortlessly...',
    level: 'BEGINNER',
    image: '/images/features/build.png',
    popular: false,
  },
  {
    category: 'Security',
    title: 'Secure Wallet',
    description: 'Learn about multi-sig wallets, hardware security, and best practices for protecting your assets...',
    level: 'INTERMEDIATE',
    image: '/images/features/volcano.png',
    popular: false,
  },
  {
    category: 'Community',
    title: 'Join Groups',
    description: 'Connect with other savers, share strategies, and participate in community savings pools...',
    level: 'BEGINNER',
    image: '/images/features/old.png',
    popular: false,
  },
];

/**
 * Features Section Component
 * Displays key features in a card layout similar to Codédex
 */
export function FeaturesSection() {
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const headingRef = useRef(null);
  const isInView = useInView(headingRef, { once: true });

  const fullText = 'Journey through the world of puddling';

  useEffect(() => {
    if (!isInView) return;

    let index = 0;
    setDisplayedText('');
    setIsTypingComplete(false);

    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 75); // Adjust speed here (lower = faster)

    return () => clearInterval(typingInterval);
  }, [isInView]);

  const filteredFeatures = activeCategory === 'Popular'
    ? features
    : features.filter(f => f.category === activeCategory);

  return (
    <section id="features" className="py-20 px-4 bg-[var(--color-background)]">
      <div className="container-responsive max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 
            ref={headingRef}
            className="font-[family-name:var(--font-pixel)] text-3xl md:text-4xl lg:text-5xl text-[var(--color-text-primary)] min-h-[120px] md:min-h-[140px] leading-relaxed" 
            style={{ imageRendering: 'pixelated', lineHeight: '1.3' }}
          >
            {displayedText.split(' world of puddling')[0]}
            {displayedText.includes('world of puddling') && (
              <>
                <br />
                world of puddling
              </>
            )}
            {!isTypingComplete && (
              <span className="inline-block w-1 h-8 md:h-10 lg:h-12 bg-[var(--color-text-primary)] ml-1 animate-pulse"></span>
            )}
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto mt-4">
            Learn to puddle with fun, make money, save time, and create experience through Puddle.
          </p>
        </motion.div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full text-base font-medium transition-all ${
                activeCategory === category
                  ? 'bg-[var(--color-primary-500)] text-white shadow-lg'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)]'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:shadow-xl transition-shadow cursor-pointer group"
            >
              {/* Feature Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-400">
                <Image 
                  src={feature.image} 
                  alt={feature.title}
                  fill
                  className="object-cover"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                  FEATURE
                </div>
                <h3 className="font-[family-name:var(--font-pixel)] text-xl text-[var(--color-text-primary)] mb-3 group-hover:text-[var(--color-primary-500)] transition-colors" style={{ imageRendering: 'pixelated' }}>
                  {feature.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Level Badge */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)]"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--color-border)]"></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--color-border)]"></div>
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    {feature.level}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mt-12 px-4"
        >
          <Link href="/explore" className="w-full sm:w-auto">
            <Button className="btn-pixel font-[family-name:var(--font-pixel)] text-xs sm:text-sm px-6 sm:px-8 py-5 sm:py-6 shadow-2xl hover:shadow-xl group w-full sm:w-auto">
              Explore all
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
