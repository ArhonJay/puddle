'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ProtectedRoute, MainLayout } from '@/components/layout';
import { useAuth } from '@/lib/hooks';

export default function HomePage() {
  const { user } = useAuth();

  const exploreCards = [
    { title: 'DeFi Tutorials', description: 'Practice what you learned with bite-sized Web3 challenges.', icon: '' },
    { title: 'Savings Strategies', description: 'Explore fun, step-by-step strategies from beginner to advanced.', icon: '' },
    { title: 'MonthPuddle', description: 'Commit to 30 days of saving and building-while raising a virtual pet!', icon: '' },
    { title: 'Portfolio', description: 'Create and share your Web3 journey and savings goals.', icon: '' },
  ];

  const tutorials = [
    { title: 'Intro to DeFi', type: 'TUTORIAL', gradient: 'from-yellow-400 to-orange-500' },
    { title: 'Smart Savings', type: 'TUTORIAL', gradient: 'from-blue-400 to-purple-500' },
    { title: 'Web3 Wallet', type: 'TUTORIAL', gradient: 'from-purple-400 to-blue-600' },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen bg-[#0a1628] text-white">
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">

              {/* Welcome Card */}
              <div className="flex-1 w-full">
                <div className="bg-[#1e3a52] rounded-2xl p-8 mb-6">
                  <h1 className="font-[family-name:var(--font-pixel)] text-4xl text-center mb-4" style={{ imageRendering: 'pixelated' }}>
                    Welcome to Puddle!
                  </h1>
                  <p className="text-center text-white/80 mb-6">
                    Your Web3 savings journey awaits-but first let's find something to learn.
                  </p>
                  <div className="flex justify-center">
                    <button className="bg-[#3b9dff] hover:bg-[#2a8ae8] text-white px-8 py-3 rounded-lg font-[family-name:var(--font-pixel)] text-sm border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all">
                      Get Started
                    </button>
                  </div>
                </div>

                {/* User Profile Card */}
                <div className="bg-[#1e3a52] rounded-2xl p-6 border-2 border-[#2a4a62]">
                  <div className="flex items-center gap-4 mb-6">
                    <div>
                      <h3 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                        {user?.name || 'sopenaaar069882'}
                      </h3>
                      <p className="text-white/60">Level 1</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="text-white/60 text-sm">0</p>
                        <p className="text-xs text-white/40">Total XP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🥉</span>
                      <div>
                        <p className="text-white/60 text-sm">Bronze</p>
                        <p className="text-xs text-white/40">Rank</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      <div>
                        <p className="text-white/60 text-sm">0</p>
                        <p className="text-xs text-white/40">Badges</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="text-white/60 text-sm">2</p>
                        <p className="text-xs text-white/40">Day streak</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-[#1e3a52] hover:bg-[#2a4a62] text-white py-3 rounded-lg border-2 border-[#2a4a62] font-[family-name:var(--font-pixel)] text-sm transition-colors">
                    View profile
                  </button>
                </div>
              </div>

              {/* Events Sidebar */}
              <div className="w-full lg:w-80">
                <div className="bg-[#1e3a52] rounded-2xl p-6 border-2 border-[#2a4a62]">
                  <h3 className="font-[family-name:var(--font-pixel)] text-xl mb-4" style={{ imageRendering: 'pixelated' }}>
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="bg-yellow-500 rounded-lg w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-black">NOV</span>
                        <span className="text-lg font-bold text-black">8</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">DeFi Workshop Dallas</h4>
                        <p className="text-xs text-white/60">Sat Nov 8th @ 9:00pm ET</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-green-500 rounded-lg w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-black">NOV</span>
                        <span className="text-lg font-bold text-black">12</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Savings Workshop (Tentative)</h4>
                        <p className="text-xs text-white/60">Wed Nov 12th @ 3:00pm ET</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-orange-500 rounded-lg w-12 h-12 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-black">NOV</span>
                        <span className="text-lg font-bold text-black">25</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Web3 Meetup - The Documentary</h4>
                        <p className="text-xs text-white/60">Tue Nov 25th @ 3:00pm ET</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explore Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="font-[family-name:var(--font-pixel)] text-3xl mb-8" style={{ imageRendering: 'pixelated' }}>
              Explore more
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {exploreCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1e3a52] rounded-2xl p-6 border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{card.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-[family-name:var(--font-pixel)] text-xl mb-2 group-hover:text-[#3b9dff] transition-colors" style={{ imageRendering: 'pixelated' }}>
                        {card.title}
                      </h3>
                      <p className="text-white/70 text-sm">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tutorials */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-pixel)] text-3xl" style={{ imageRendering: 'pixelated' }}>
                New project tutorials
              </h2>
              <Link href="/tutorials" className="text-[#3b9dff] hover:text-[#2a8ae8] font-semibold transition-colors">
                See all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tutorials.map((tutorial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${tutorial.gradient} rounded-2xl aspect-square flex items-center justify-center mb-3 overflow-hidden relative group-hover:scale-105 transition-transform`}>
                  </div>
                  <div className="bg-[#0f1d2b] px-3 py-1 rounded-lg inline-block mb-2">
                    <span className="text-xs font-semibold text-white/60">{tutorial.type}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-pixel)] text-lg group-hover:text-[#3b9dff] transition-colors" style={{ imageRendering: 'pixelated' }}>
                    {tutorial.title}
                  </h3>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Invite Section */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="font-[family-name:var(--font-pixel)] text-4xl mb-4" style={{ imageRendering: 'pixelated' }}>
                Invite a Friend
              </h2>
              <p className="text-white/80 mb-2">
                Having fun? Share the love with a friend (or two)!
              </p>
              <p className="text-white/80 mb-8">
                Enter an email and we'll send them a personal invite 
              </p>  

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Your friend's email"
                  className="w-full sm:flex-1 px-6 py-3 bg-[#1e3a52] border-2 border-[#2a4a62] rounded-lg text-white placeholder:text-white/40 focus:border-[#3b9dff] focus:outline-none"
                />
                <button className="w-full sm:w-auto bg-[#a8ff00] hover:bg-[#90e000] text-black px-8 py-3 rounded-lg font-[family-name:var(--font-pixel)] text-sm border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all">
                  Send Invite
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center gap-2 mb-8">
                <span className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                  Puddle
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-4 uppercase tracking-wider">COMPANY</h4>
                  <ul className="space-y-2">
                    <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About</Link></li>
                    <li><Link href="/blog" className="text-white/80 hover:text-white transition-colors">Blog</Link></li>
                    <li><Link href="/shop" className="text-white/80 hover:text-white transition-colors">Shop</Link></li>
                    <li><Link href="/community" className="text-white/80 hover:text-white transition-colors">Community</Link></li>
                    <li><Link href="/help" className="text-white/80 hover:text-white transition-colors">Help Center</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-4 uppercase tracking-wider">PRACTICE</h4>
                  <ul className="space-y-2">
                    <li><Link href="/challenges" className="text-white/80 hover:text-white transition-colors">Challenges</Link></li>
                    <li><Link href="/projects" className="text-white/80 hover:text-white transition-colors">Projects</Link></li>
                    <li><Link href="/30days" className="text-white/80 hover:text-white transition-colors">PuddleMonth</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-4 uppercase tracking-wider">LEARN</h4>
                  <ul className="space-y-2">
                    <li><Link href="/courses" className="text-white/80 hover:text-white transition-colors">All Courses</Link></li>
                    <li><Link href="/defi" className="text-white/80 hover:text-white transition-colors">DeFi</Link></li>
                    <li><Link href="/web3" className="text-white/80 hover:text-white transition-colors">Web3 Basics</Link></li>
                    <li><Link href="/savings" className="text-white/80 hover:text-white transition-colors">Smart Savings</Link></li>
                    <li><Link href="/nft" className="text-white/80 hover:text-white transition-colors">NFTs</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white/60 text-sm font-semibold mb-4 uppercase tracking-wider">POPULAR</h4>
                  <ul className="space-y-2">
                    <li><Link href="/ethereum" className="text-white/80 hover:text-white transition-colors">Ethereum</Link></li>
                    <li><Link href="/solana" className="text-white/80 hover:text-white transition-colors">Solana</Link></li>
                    <li><Link href="/wallet" className="text-white/80 hover:text-white transition-colors">Wallet Setup</Link></li>
                    <li><Link href="/staking" className="text-white/80 hover:text-white transition-colors">Staking</Link></li>
                  </ul>
                </div>
              </div>

              <div className="text-center text-white/40 text-sm pt-8 border-t border-white/10">
                Made with ❤️ in the Puddleverse
              </div>
            </div>
          </footer>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
