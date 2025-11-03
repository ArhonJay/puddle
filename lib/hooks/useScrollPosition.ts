'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';

interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | null;
  isAtTop: boolean;
}

/**
 * Custom hook to track scroll position and direction
 * Used for navbar transparency and parallax effects
 */
export function useScrollPosition(threshold = 50) {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    isAtTop: true,
  });

  const setNavbarTransparent = useUIStore((state) => state.setNavbarTransparent);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;

      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      const isAtTop = currentScrollY < threshold;

      setScrollPosition({
        x: currentScrollX,
        y: currentScrollY,
        direction,
        isAtTop,
      });

      // Update navbar transparency based on scroll position
      setNavbarTransparent(isAtTop);

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    // Initial check
    updateScrollPosition();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, setNavbarTransparent]);

  return scrollPosition;
}

/**
 * Hook to get scroll progress (0-1) for animations
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? scrolled / scrollHeight : 0;
      setProgress(progress);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial calculation

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
}
