'use client';

import { useState, useEffect } from 'react';

/**
 * Media query breakpoints matching our CSS theme
 */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Custom hook to detect media query matches
 * Useful for responsive behavior and conditional rendering
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
}

/**
 * Hook to check if screen is at least a certain breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]}px)`;
  return useMediaQuery(query);
}

/**
 * Hook to get current breakpoint
 */
export function useCurrentBreakpoint(): Breakpoint | 'xs' {
  const isSm = useBreakpoint('sm');
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  const isXl = useBreakpoint('xl');
  const is2xl = useBreakpoint('2xl');

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

/**
 * Hook to detect mobile devices (below md breakpoint)
 */
export function useIsMobile(): boolean {
  return !useBreakpoint('md');
}

/**
 * Hook to detect tablet devices (md to lg)
 */
export function useIsTablet(): boolean {
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  return isMd && !isLg;
}

/**
 * Hook to detect desktop devices (lg and above)
 */
export function useIsDesktop(): boolean {
  return useBreakpoint('lg');
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
