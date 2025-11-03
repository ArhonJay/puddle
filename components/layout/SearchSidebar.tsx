'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/uiStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search } from 'lucide-react';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface Person {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

// Mock popular courses
const popularCourses: Course[] = [
  {
    id: '1',
    title: 'Save Money',
    description: 'Instantly save money through instant and automated savings strategies.',
    image: '/images/features/ench_forest.png',
  },
  {
    id: '2',
    title: 'Invest Basics',
    description: 'Create your first investment portfolio and learn the fundamentals of investing.',
    image: '/images/features/build.png',
  },
  {
    id: '3',
    title: 'Spend Wisely',
    description: 'Learn variety of things to spend your money effectively.',
    image: '/images/features/old.png',
  },
];

// Mock people to follow
const peopleToFollow: Person[] = [
  {
    id: '1',
    name: 'Prunde',
    username: '@Prunde',
    avatar: 'P',
  },
  {
    id: '2',
    name: 'Love123',
    username: '@Love123',
    avatar: 'L',
  },
  {
    id: '3',
    name: 'Eren Yagger',
    username: '@ErenYagger',
    avatar: 'E',
  },
];

export function SearchSidebar() {
  const { isSearchSidebarOpen, closeSearchSidebar } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isSearchSidebarOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isSearchSidebarOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchSidebarOpen) {
        closeSearchSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchSidebarOpen, closeSearchSidebar]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSearchSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchSidebarOpen]);

  return (
    <AnimatePresence>
      {isSearchSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overlay"
            onClick={closeSearchSidebar}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[var(--color-background)] shadow-2xl z-[var(--z-modal)] overflow-hidden flex flex-col"
          >
            {/* Header with Search */}
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSearchSidebar}
                  className="rounded-full ml-auto"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-text-tertiary)]" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search features, users, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-base bg-[var(--color-surface)] border-[var(--color-border)] rounded-lg"
                  style={{ color: 'var(--color-text-tertiary)' }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Popular Courses */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
                  POPULAR FEATURES
                </h3>
                <div className="space-y-3">
                  {popularCourses.map((course) => (
                    <button
                      key={course.id}
                      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors group"
                    >
                      {/* Course Image */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                          src={course.image} 
                          alt={course.title}
                          fill
                          className="object-cover"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            // Fallback to gradient with first letter if image fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {/* Fallback gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-2xl text-white/40 -z-10">
                          {course.title[0]}
                        </div>
                      </div>
                      
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-500)] transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {course.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* People to Follow */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
                  PEOPLE TO FOLLOW
                </h3>
                <div className="space-y-3">
                  {peopleToFollow.map((person) => (
                    <button
                      key={person.id}
                      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-2xl flex-shrink-0">
                        {person.avatar}
                      </div>
                      
                      {/* Person Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-500)] transition-colors">
                          {person.name}
                        </h4>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {person.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
