'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Vault, 
  Compass, 
  Settings, 
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/puddle', icon: Home },
  { name: 'Vault', href: '/puddle/vault', icon: Vault },
  { name: 'Explore', href: '/puddle/explore', icon: Compass },
  { name: 'Settings', href: '/puddle/settings', icon: Settings },
  { name: 'Puddle AI', href: '/puddle/ai', icon: Bot },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(20); // Percentage width (20% = 1/5)
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = ((e.clientX - startX) / window.innerWidth) * 100;
      const newWidth = Math.max(15, Math.min(50, startWidth + delta)); // 15% to 50%
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate desktop width only on client side
  const desktopWidth = isMounted && typeof window !== 'undefined' && window.innerWidth >= 1024 
    ? `${width}%` 
    : undefined;

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 z-30 transition-all duration-300",
        // Desktop: normal sidebar
        "lg:w-[20%] md:w-[25%]",
        // Mobile: slide in/out
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0 w-[75%] shadow-xl" : "-translate-x-full w-[75%]",
        isCollapsed && "lg:w-16"
      )}
      style={{ 
        width: isCollapsed ? '64px' : desktopWidth
      }}
    >
      {/* Resize Handle - Desktop only */}
      {!isCollapsed && (
        <div
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-blue-500 transition-colors group"
          onMouseDown={handleResize}
        >
          <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-4 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Content */}
      <div className="h-full flex flex-col">

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close mobile sidebar when link is clicked
                  if (onClose && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("w-5 h-5", isCollapsed ? "" : "flex-shrink-0")} />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
