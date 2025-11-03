'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollPosition } from '@/lib/hooks/useScrollPosition';
import { useTheme } from '@/lib/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/lib/store/uiStore';
import { Button } from '@/components/ui/button';
import {
  Moon,
  Sun,
  Search,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

const navLinks: NavLink[] = [
  { label: 'Explore', href: '/explore' },
  { label: 'Foundation', href: '/foundation' },
  { label: 'Build', href: '/build' },
  { label: 'Community', href: '/community' },
  { label: 'Docs', href: '/docs' },
  { label: 'Whitelist', href: '/whitelist' },
];

export function Navbar() {
  const { isAtTop } = useScrollPosition(50);
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const { 
    isMobileMenuOpen, 
    toggleMobileMenu, 
    closeMobileMenu,
    openSearchSidebar 
  } = useUIStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Navbar background based on scroll position
  const navbarClasses = `
    fixed top-0 left-0 right-0 z-[var(--z-fixed)]
    transition-all duration-300 theme-transition
    bg-[var(--color-surface)] border-b border-[var(--color-border)]
    ${isAtTop ? '' : 'shadow-md'}
  `;

  const handleSearchClick = () => {
    openSearchSidebar();
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 h-[var(--navbar-height)] z-[var(--z-fixed)]" />
    );
  }

  return (
    <nav className={navbarClasses}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-[var(--navbar-height)]">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
            onClick={closeMobileMenu}
          >
            <span className="text-xl font-bold text-gradient font-[family-name:var(--font-pixel)]" style={{ imageRendering: 'pixelated' }}>Puddle</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchClick}
              className="rounded-lg"
              aria-label="Search"
              style={{ imageRendering: 'pixelated' }}
            >
              <Search className="h-5 w-5" style={{ imageRendering: 'pixelated' }} />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg"
              aria-label="Toggle theme"
              style={{ imageRendering: 'pixelated' }}
            >
              {isDark ? (
                <Sun className="h-5 w-5" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <Moon className="h-5 w-5" style={{ imageRendering: 'pixelated' }} />
              )}
            </Button>

            {/* User Menu / Sign Up Button */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface-hover)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button className="btn-pixel font-[family-name:var(--font-pixel)] text-sm px-6 py-2 shadow-lg hover:shadow-xl" style={{ imageRendering: 'pixelated' }}>
                  Sign up
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden rounded-lg"
              aria-label="Menu"
              style={{ imageRendering: 'pixelated' }}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" style={{ imageRendering: 'pixelated' }} />
              ) : (
                <Menu className="h-5 w-5" style={{ imageRendering: 'pixelated' }} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[var(--color-surface)] border-b border-[var(--color-border)]"
          >
            <div className="container-responsive py-4 space-y-4">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="block py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile User Section */}
              {isAuthenticated && user ? (
                <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center">
                      <User className="h-5 w-5 text-white" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium font-[family-name:var(--font-pixel)]" style={{ imageRendering: 'pixelated' }}>{user.name || user.email}</p>
                      <p className="text-xs text-[var(--color-text-tertiary)] font-[family-name:var(--font-pixel)]" style={{ imageRendering: 'pixelated' }}>{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full font-[family-name:var(--font-pixel)] text-sm rounded-lg"
                    onClick={handleLogout}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <LogOut className="h-4 w-4 mr-2" style={{ imageRendering: 'pixelated' }} />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={closeMobileMenu}>
                  <Button className="w-full btn-pixel font-[family-name:var(--font-pixel)] text-sm py-2 shadow-lg" style={{ imageRendering: 'pixelated' }}>
                    Sign up
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
