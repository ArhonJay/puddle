'use client';

import { Navbar } from './Navbar';
import { SearchSidebar } from './SearchSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

/**
 * Main Layout Component
 * Combines Navbar and SearchSidebar
 */
export function MainLayout({ children, showNavbar = true }: MainLayoutProps) {
  return (
    <>
      {showNavbar && <Navbar />}
      <SearchSidebar />
      <main className={showNavbar ? 'pt-[var(--navbar-height)]' : ''}>
        {children}
      </main>
    </>
  );
}
