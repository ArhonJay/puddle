'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface MiddlewareWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Middleware Wrapper Component
 * Handles authentication checks and redirects
 * 
 * Usage:
 * <MiddlewareWrapper requireAuth={true}>
 *   <ProtectedPage />
 * </MiddlewareWrapper>
 */
export function MiddlewareWrapper({
  children,
  requireAuth = false,
  redirectTo,
}: MiddlewareWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't check until auth is initialized
    if (isLoading) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      const redirect = redirectTo || '/login';
      router.push(`${redirect}?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (!requireAuth && isAuthenticated && pathname === '/') {
      // User is on landing page but authenticated, redirect to home
      router.push('/home');
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, redirectTo]);

  // Show loading state while checking
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Protected Route Component
 * Shorthand for pages that require authentication
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <MiddlewareWrapper requireAuth={true} redirectTo="/login">
      {children}
    </MiddlewareWrapper>
  );
}

/**
 * Public Route Component
 * For pages that should redirect authenticated users
 */
export function PublicRoute({ 
  children, 
  redirectTo = '/home' 
}: { 
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.push(redirectTo);
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
