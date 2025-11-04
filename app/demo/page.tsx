'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, TrendingUp, TrendingDown, Users, Wallet, DollarSign, ArrowLeft } from 'lucide-react';

type Network = 'ethereum' | 'btc' | 'solana';

interface Vault {
  id: number;
  title: string;
  description: string;
  network: Network;
  investors: number;
  users: number;
  tvl: string;
  performance: 'good' | 'bad';
  apy: string;
  image: string;
  creator: string;
  timeAgo: string;
  likes: number;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  minInvestment: string;
}

const vaults: Vault[] = [
  {
    id: 1,
    title: 'DeFi Yield Optimizer',
    description: 'Automated yield farming strategy across multiple DeFi protocols for maximum returns',
    network: 'ethereum',
    investors: 1247,
    users: 3891,
    tvl: '$2.4M',
    performance: 'good',
    apy: '12.5%',
    image: '/images/features/ench_forest.png',
    creator: '@CryptoWhale',
    timeAgo: '2d',
    likes: 234,
    category: 'DeFi',
    riskLevel: 'Medium',
    minInvestment: '0.1 ETH',
  },
  {
    id: 2,
    title: 'Stable Savings Pool',
    description: 'Low-risk savings vault focusing on stablecoins with consistent APY returns',
    network: 'ethereum',
    investors: 892,
    users: 2156,
    tvl: '$1.8M',
    performance: 'good',
    apy: '8.2%',
    image: '/images/features/see.png',
    creator: '@SafeSaver',
    timeAgo: '5d',
    likes: 189,
    category: 'Savings',
    riskLevel: 'Low',
    minInvestment: '0.05 ETH',
  },
  {
    id: 3,
    title: 'NFT Collateral Vault',
    description: 'Borrow against your NFT portfolio while maintaining ownership and earning yields',
    network: 'solana',
    investors: 456,
    users: 1203,
    tvl: '$890K',
    performance: 'good',
    apy: '15.8%',
    image: '/images/features/float.png',
    creator: '@NFTMaster',
    timeAgo: '1w',
    likes: 156,
    category: 'NFT',
    riskLevel: 'High',
    minInvestment: '2 SOL',
  },
  {
    id: 4,
    title: 'Bitcoin HODLer Fund',
    description: 'Long-term Bitcoin accumulation strategy with DCA and lending optimization',
    network: 'btc',
    investors: 678,
    users: 1891,
    tvl: '$3.2M',
    performance: 'bad',
    apy: '6.5%',
    image: '/images/features/build.png',
    creator: '@BTCMaxi',
    timeAgo: '3d',
    likes: 201,
    category: 'Bitcoin',
    riskLevel: 'Low',
    minInvestment: '0.01 BTC',
  },
  {
    id: 5,
    title: 'GameFi Treasure Chest',
    description: 'Invest in play-to-earn gaming tokens and in-game asset yields',
    network: 'solana',
    investors: 1123,
    users: 4567,
    tvl: '$1.1M',
    performance: 'good',
    apy: '22.3%',
    image: '/images/features/volcano.png',
    creator: '@GameMaster',
    timeAgo: '12h',
    likes: 412,
    category: 'GameFi',
    riskLevel: 'High',
    minInvestment: '5 SOL',
  },
  {
    id: 6,
    title: 'Liquidity Provider Pro',
    description: 'Provide liquidity to DEX pools with automatic rebalancing and fee optimization',
    network: 'ethereum',
    investors: 534,
    users: 1678,
    tvl: '$1.5M',
    performance: 'good',
    apy: '18.7%',
    image: '/images/features/old.png',
    creator: '@LiquidityKing',
    timeAgo: '4d',
    likes: 267,
    category: 'Liquidity',
    riskLevel: 'Medium',
    minInvestment: '0.2 ETH',
  },
];

const categories = ['All Vaults', 'DeFi', 'Savings', 'NFT', 'Bitcoin', 'GameFi', 'Liquidity'];
const filters = ['Newest', 'Most Popular', 'Highest APY', 'Lowest Risk'];

const networkColors = {
  ethereum: 'bg-blue-500',
  btc: 'bg-orange-500',
  solana: 'bg-purple-500',
};

const networkNames = {
  ethereum: 'Ethereum',
  btc: 'Bitcoin',
  solana: 'Solana',
};

export default function DemoPage() {
  const router = useRouter();
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [activeCategory, setActiveCategory] = useState('All Vaults');
  const [activeFilter, setActiveFilter] = useState('Newest');

  const filteredVaults = activeCategory === 'All Vaults' 
    ? vaults 
    : vaults.filter(v => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="flex">
          {/* Sidebar */}
          <aside className="hidden lg:block fixed left-0 top-0 w-64 border-r border-[#2a4a62] h-screen overflow-hidden pt-20 bg-[#0a1628]">
            <div className="p-6">
              {/* Navigation Links */}
              <div className="space-y-2 mb-8">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1e3a52] text-white font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Home</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Leaderboards</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#3b9dff] text-white font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Puddlecase</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Monthly Challenge</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>#30DaysOfPuddle</span>
                </button>
              </div>

              {/* Channels Section */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-4">
                  Channels
                </h3>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>General</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>Question of the Week</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>Introductions</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>DeFi</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>Web3 Basics</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>Savings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all text-sm">
                    <span>#</span>
                    <span>Career</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full pt-6 pb-16 px-4 sm:px-6 lg:px-10 lg:ml-64 lg:pt-8">
            <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8 lg:mb-12 mt-4">
            {/* Back Button - Shows on mobile above title */}
            <button
              onClick={() => router.back()}
              className="lg:fixed lg:top-6 lg:left-6 lg:z-50 mb-4 lg:mb-0 inline-flex items-center gap-2 px-3 py-2 lg:px-4 bg-[#1e3a52] hover:bg-[#2a4a62] border-[3px] border-black rounded-lg font-[family-name:var(--font-pixel)] text-xs lg:text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              style={{ imageRendering: 'pixelated' }}
            >
              <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <h1 className="font-[family-name:var(--font-pixel)] text-2xl sm:text-3xl md:text-4xl mb-2" style={{ imageRendering: 'pixelated' }}>
              Puddlecase
            </h1>
            <p className="text-white/70 text-sm sm:text-base md:text-lg">
              Discover and invest in community-created saving vaults
            </p>
          </div>

          {/* Category Tabs with New Vault Button */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-6 lg:mb-8 overflow-x-auto pb-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-sm sm:text-base font-semibold whitespace-nowrap transition-all ${
                    category === 'All Vaults' ? '' : 'hidden sm:inline-flex'
                  } ${
                    activeCategory === category
                      ? 'bg-white text-[#0a1628]'
                      : 'bg-[#1e3a52] text-white/70 hover:text-white border-2 border-[#2a4a62]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button className="ml-auto bg-[#3b9dff] hover:bg-[#2a8ae8] text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full font-[family-name:var(--font-pixel)] text-xs sm:text-sm border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all whitespace-nowrap">
              + New Vault
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
            <span className="text-white/60 font-semibold text-sm sm:text-base">Sort by:</span>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full sm:w-auto bg-[#1e3a52] text-white px-4 sm:px-6 py-2 sm:py-3 pr-10 sm:pr-12 rounded-lg border-2 border-[#2a4a62] text-sm sm:text-base font-semibold appearance-none cursor-pointer hover:border-[#3b9dff] transition-colors"
              >
                {filters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {/* Vaults Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredVaults.map((vault, index) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1e3a52] rounded-xl overflow-hidden border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all cursor-pointer group flex flex-col"
                onClick={() => setSelectedVault(vault)}
              >
                {/* Vault Image */}
                <div className="relative h-36 overflow-hidden flex-shrink-0">
                  <Image
                    src={vault.image}
                    alt={vault.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className={`absolute top-2 right-2 ${networkColors[vault.network]} px-2 py-1 rounded-full text-xs font-bold text-white`}>
                    {networkNames[vault.network]}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                    <div>
                      <span className="text-xs text-white/60">{vault.creator}</span>
                      <span className="text-xs text-white/40 ml-2">• {vault.timeAgo}</span>
                    </div>
                  </div>

                  <h3 className="font-[family-name:var(--font-pixel)] text-lg mb-2 group-hover:text-[#3b9dff] transition-colors" style={{ imageRendering: 'pixelated' }}>
                    {vault.title}
                  </h3>

                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {vault.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#0a1628] rounded-lg p-2">
                      <div className="text-xs text-white/60 mb-1">TVL</div>
                      <div className="font-bold text-sm text-white">{vault.tvl}</div>
                    </div>
                    <div className="bg-[#0a1628] rounded-lg p-2">
                      <div className="text-xs text-white/60 mb-1">APY</div>
                      <div className={`font-bold text-sm flex items-center gap-1 ${vault.performance === 'good' ? 'text-green-400' : 'text-red-400'}`}>
                        {vault.apy}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{vault.users.toLocaleString()} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wallet className="w-3 h-3" />
                      <span>{vault.investors} investors</span>
                    </div>
                  </div>

                  {/* Button pushed to bottom with mt-auto */}
                  <button className="w-full mt-auto bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-2 rounded-lg font-[family-name:var(--font-pixel)] text-xs border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all">
                    Invest Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
            </div>
          </main>
        </div>

      {/* Vault Detail Modal */}
      <AnimatePresence>
        {selectedVault && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVault(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-[#3b9dff] shadow-[0_0_50px_rgba(59,157,255,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVault(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-[#0a1628] hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors border-2 border-[#2a4a62]"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6">
                {/* Image */}
                <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
                  <Image
                    src={selectedVault.image}
                    alt={selectedVault.title}
                    fill
                    className="object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                {/* Title */}
                <h3 className="font-[family-name:var(--font-pixel)] text-2xl md:text-3xl mb-4" style={{ imageRendering: 'pixelated' }}>
                  {selectedVault.title}
                </h3>

                {/* Description */}
                <p className="text-white/80 leading-relaxed mb-6 text-base md:text-lg">
                  {selectedVault.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button className="flex-1 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-4 rounded-lg font-[family-name:var(--font-pixel)] text-base md:text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all">
                    Invest Now
                  </button>
                  <button className="flex-1 bg-[#0a1628] hover:bg-[#1e3a52] text-white py-4 rounded-lg font-[family-name:var(--font-pixel)] text-base md:text-lg border-[3px] border-[#2a4a62] hover:border-[#3b9dff] transition-all">
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
