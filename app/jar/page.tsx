'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  X, 
  Plus, 
  ArrowLeft, 
  Shield, 
  ExternalLink, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  Share2,
  Target,
  CheckCircle,
  Info,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { useJarsStore, selectTotalSaved, selectTotalGoal } from '@/lib/store/jarsStore';
import { useProfileStore } from '@/lib/store/profileStore';
import type { Jar, Transaction } from '@/types/database.types';

// Contract info for transparency
const contractInfo = {
  address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  network: 'Base',
  explorerUrl: 'https://basescan.org/address/',
};

// Available jar cover images
const JAR_IMAGES = [
  { id: 'build', src: '/images/features/build.png', name: 'Build' },
  { id: 'forest', src: '/images/features/ench_forest.png', name: 'Forest' },
  { id: 'float', src: '/images/features/float.png', name: 'Float' },
  { id: 'old', src: '/images/features/old.png', name: 'Old' },
  { id: 'see', src: '/images/features/see.png', name: 'See' },
  { id: 'volcano', src: '/images/features/volcano.png', name: 'Volcano' },
];

export default function JarPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Stores
  const { 
    jars, 
    selectedJar, 
    transactions,
    isLoading: jarsLoading, 
    isTransacting,
    fetchJars, 
    createJar, 
    selectJar,
    deposit,
    withdraw,
  } = useJarsStore();
  const { profile, fetchProfile, refreshProfile } = useProfileStore();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showSafetyCard, setShowSafetyCard] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string>(JAR_IMAGES[0].id);
  
  // Create jar form state
  const [newJarName, setNewJarName] = useState('');
  const [newJarGoal, setNewJarGoal] = useState('');
  const [newJarDate, setNewJarDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchJars(user.id);
      fetchProfile(user.id, user.name);
    }
  }, [user?.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const getSelectedImage = () => {
    return JAR_IMAGES.find(img => img.id === selectedImageId) || JAR_IMAGES[0];
  };

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setSelectedImageId(JAR_IMAGES[0].id);
    setNewJarName('');
    setNewJarGoal('');
    setNewJarDate('');
  };

  const handleCreateJar = async () => {
    if (!user?.id || !newJarName || !newJarGoal) return;
    
    setIsCreating(true);
    const selectedImage = getSelectedImage();
    const jar = await createJar(user.id, {
      name: newJarName,
      goal_amount: parseFloat(newJarGoal),
      target_date: newJarDate || undefined,
      image_url: selectedImage.src,
    });
    
    if (jar) {
      resetCreateModal();
      await refreshProfile(user.id);
    }
    setIsCreating(false);
  };

  const handleDeposit = async () => {
    if (!user?.id || !selectedJar || !depositAmount) return;
    
    const amount = parseFloat(depositAmount);
    const success = await deposit(user.id, selectedJar.id, amount);
    
    if (success) {
      setShowDepositModal(false);
      setDepositAmount('');
      await refreshProfile(user.id);
    }
  };

  const handleWithdraw = async () => {
    if (!user?.id || !selectedJar || !withdrawAmount) return;
    
    const amount = parseFloat(withdrawAmount);
    const success = await withdraw(user.id, selectedJar.id, amount);
    
    if (success) {
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      await refreshProfile(user.id);
    }
  };

  // Check localStorage on mount to see if user dismissed the safety card
  useEffect(() => {
    const dismissed = localStorage.getItem('puddle-safety-card-dismissed');
    if (dismissed === 'true') {
      setShowSafetyCard(false);
    }
  }, []);

  const dismissSafetyCard = () => {
    setShowSafetyCard(false);
    localStorage.setItem('puddle-safety-card-dismissed', 'true');
  };

  const totalSaved = selectTotalSaved({ jars, selectedJar, transactions, isLoading: jarsLoading, isTransacting, error: null });
  const totalGoal = selectTotalGoal({ jars, selectedJar, transactions, isLoading: jarsLoading, isTransacting, error: null });

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProjectedDate = (jar: Jar) => {
    const daysActive = Math.max(1, Math.ceil((new Date().getTime() - new Date(jar.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = jar.current_amount / daysActive;
    if (dailyRate <= 0) return 'Keep saving!';
    const daysToGoal = Math.ceil((jar.goal_amount - jar.current_amount) / dailyRate);
    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysToGoal);
    return projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#3b9dff] mx-auto mb-4" />
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 w-64 border-r border-[#2a4a62] h-screen overflow-hidden pt-20 bg-[#0a1628]">
          <div className="p-6">
            {/* Navigation Links */}
            <div className="space-y-2 mb-8">
              <button 
                onClick={() => router.push('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#3b9dff] text-white font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Puddlejar</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-[#1e3a52] transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Activity</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#1e3a52] rounded-xl p-4 mb-6">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                Total Savings
              </h3>
              <p className="font-[family-name:var(--font-pixel)] text-2xl text-[#3b9dff]" style={{ imageRendering: 'pixelated' }}>
                {formatCurrency(totalSaved)}
              </p>
              <p className="text-xs text-white/60 mt-1">
                of {formatCurrency(totalGoal)} goal
              </p>
              <div className="mt-3 bg-[#0a1628] rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#3b9dff] to-[#a8ff00] rounded-full transition-all duration-500"
                  style={{ width: `${getProgress(totalSaved, totalGoal)}%` }}
                />
              </div>
            </div>

            {/* Token Info */}
            <div className="bg-[#1e3a52] rounded-xl p-4">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                Supported Token
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                  $
                </div>
                <div>
                  <p className="font-semibold">USDC</p>
                  <p className="text-xs text-white/60">USD Coin</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full pt-6 pb-16 px-4 sm:px-6 lg:px-10 lg:ml-64 lg:pt-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 lg:mb-10 mt-4">
              <button
                onClick={() => router.back()}
                className="lg:fixed lg:top-6 lg:left-6 lg:z-50 mb-4 lg:mb-0 inline-flex items-center gap-2 px-3 py-2 lg:px-4 bg-[#1e3a52] hover:bg-[#2a4a62] border-[3px] border-black rounded-lg font-[family-name:var(--font-pixel)] text-xs lg:text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                style={{ imageRendering: 'pixelated' }}
              >
                <ArrowLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              
              <h1 className="font-[family-name:var(--font-pixel)] text-2xl sm:text-3xl md:text-4xl mb-2" style={{ imageRendering: 'pixelated' }}>
                Puddlejar
              </h1>
              <p className="text-white/70 text-sm sm:text-base md:text-lg">
                Set goals, save USDC, and withdraw anytime. Your funds, your control.
              </p>
            </div>

            {/* Safety & Transparency Card - Dismissible */}
            {showSafetyCard && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gradient-to-r from-[#1e3a52] to-[#2a4a62] rounded-2xl p-5 sm:p-6 mb-8 border-2 border-[#3b9dff]/30 relative"
              >
                <button
                  onClick={dismissSafetyCard}
                  className="absolute top-3 right-3 w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3 h-3 text-white/60" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#3b9dff]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-[#3b9dff]" />
                  </div>
                  <div className="flex-1 pr-4">
                    <h3 className="font-[family-name:var(--font-pixel)] text-lg mb-2" style={{ imageRendering: 'pixelated' }}>
                      Where Are My Funds?
                    </h3>
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span><strong className="text-white">Non-custodial:</strong> You always control your funds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span><strong className="text-white">Withdraw anytime:</strong> No lock-up periods</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span><strong className="text-white">On-chain:</strong> All transactions verifiable on {contractInfo.network}</span>
                      </div>
                    </div>
                    <a 
                      href={`${contractInfo.explorerUrl}${contractInfo.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-[#3b9dff] hover:text-[#2a8ae8] text-sm font-medium transition-colors"
                    >
                      View Contract <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Create New Jar Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full mb-8 bg-[#1e3a52] hover:bg-[#2a4a62] border-2 border-dashed border-[#3b9dff]/50 hover:border-[#3b9dff] rounded-2xl p-6 transition-all group"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 bg-[#3b9dff]/20 group-hover:bg-[#3b9dff]/30 rounded-xl flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-[#3b9dff]" />
                </div>
                <div className="text-left">
                  <p className="font-[family-name:var(--font-pixel)] text-lg text-[#3b9dff]" style={{ imageRendering: 'pixelated' }}>
                    Create New Goal Jar
                  </p>
                  <p className="text-sm text-white/60">Set a savings goal and start building your fund</p>
                </div>
              </div>
            </button>

            {/* Jars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jarsLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#3b9dff]" />
                </div>
              ) : jars.length === 0 ? (
                <div className="col-span-full text-center py-12 text-white/60">
                  <p className="text-lg mb-2">No jars yet!</p>
                  <p className="text-sm">Create your first savings goal to get started.</p>
                </div>
              ) : (
                jars.map((jar, index) => (
                <motion.div
                  key={jar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1e3a52] rounded-2xl overflow-hidden border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all cursor-pointer group"
                  onClick={() => selectJar(jar)}
                >
                  {/* Header with image */}
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={jar.image_url || JAR_IMAGES[0].src}
                      alt={jar.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-[family-name:var(--font-pixel)] text-xl mb-1 group-hover:text-[#3b9dff] transition-colors" style={{ imageRendering: 'pixelated' }}>
                      {jar.name}
                    </h3>
                    
                    {/* Progress */}
                    <div className="mt-4 mb-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progress</span>
                        <span className="font-semibold text-[#a8ff00]">{getProgress(jar.current_amount, jar.goal_amount).toFixed(0)}%</span>
                      </div>
                      <div className="bg-[#0a1628] rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[#3b9dff] to-[#a8ff00] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgress(jar.current_amount, jar.goal_amount)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Saved</p>
                        <p className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                          {formatCurrency(jar.current_amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60 mb-1">Goal</p>
                        <p className="text-white/80">{formatCurrency(jar.goal_amount)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          selectJar(jar);
                          setShowDepositModal(true);
                        }}
                        className="flex-1 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-2.5 rounded-lg font-[family-name:var(--font-pixel)] text-xs border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        Deposit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          selectJar(jar);
                          setShowWithdrawModal(true);
                        }}
                        className="flex-1 bg-[#0a1628] hover:bg-[#1e3a52] text-white py-2.5 rounded-lg font-[family-name:var(--font-pixel)] text-xs border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Jar Detail Modal */}
      <AnimatePresence>
        {selectedJar && !showDepositModal && !showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => selectJar(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-4 border-[#3b9dff] shadow-[0_0_50px_rgba(59,157,255,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={selectedJar.image_url || JAR_IMAGES[0].src}
                  alt={selectedJar.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a52] to-transparent" />
                <button
                  onClick={() => selectJar(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-6">
                  <h3 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    {selectedJar.name}
                  </h3>
                  <p className="text-white/70 text-xs">
                    Created {new Date(selectedJar.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* Progress Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Current Balance</p>
                      <p className="font-[family-name:var(--font-pixel)] text-3xl text-[#a8ff00]" style={{ imageRendering: 'pixelated' }}>
                        {formatCurrency(selectedJar.current_amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60 mb-1">Goal</p>
                      <p className="text-xl text-white">{formatCurrency(selectedJar.goal_amount)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#0a1628] rounded-full h-4 overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-[#3b9dff] to-[#a8ff00] rounded-full"
                      style={{ width: `${getProgress(selectedJar.current_amount, selectedJar.goal_amount)}%` }}
                    />
                  </div>
                  <p className="text-center text-sm text-white/60">
                    You&apos;re <span className="text-[#a8ff00] font-semibold">{getProgress(selectedJar.current_amount, selectedJar.goal_amount).toFixed(0)}%</span> to your goal!
                  </p>
                </div>

                {/* Projection Card */}
                <div className="bg-[#0a1628] rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3b9dff]/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-[#3b9dff]" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">At your current pace</p>
                      <p className="font-semibold">You&apos;ll reach your goal by <span className="text-[#3b9dff]">{getProjectedDate(selectedJar)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="mb-6">
                  <h4 className="font-[family-name:var(--font-pixel)] text-sm mb-3 flex items-center gap-2" style={{ imageRendering: 'pixelated' }}>
                    <Clock className="w-4 h-4" /> Transaction History
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {transactions.length === 0 ? (
                      <div className="text-center py-4 text-white/60 text-sm">
                        No transactions yet. Make your first deposit!
                      </div>
                    ) : (
                      transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between bg-[#0a1628] rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                              {tx.type === 'deposit' ? (
                                <ArrowDownLeft className="w-4 h-4 text-green-400" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm capitalize">{tx.type}</p>
                              <p className="text-xs text-white/60">{new Date(tx.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            {tx.tx_hash && (
                              <a 
                                href={`${contractInfo.explorerUrl}tx/${tx.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#3b9dff] hover:underline flex items-center gap-1 justify-end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {tx.tx_hash.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDepositModal(true)}
                    className="flex-1 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-3 rounded-lg font-[family-name:var(--font-pixel)] text-sm border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Deposit USDC
                  </button>
                  <button 
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex-1 bg-[#0a1628] hover:bg-[#2a4a62] text-white py-3 rounded-lg font-[family-name:var(--font-pixel)] text-sm border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all"
                  >
                    Withdraw
                  </button>
                </div>

                {/* Share Button */}
                <button className="w-full mt-3 flex items-center justify-center gap-2 text-[#3b9dff] hover:text-white py-2 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share Progress</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDepositModal && selectedJar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowDepositModal(false);
              setDepositAmount('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-md w-full border-4 border-[#3b9dff] shadow-[0_0_50px_rgba(59,157,255,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    Deposit to {selectedJar.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount('');
                    }}
                    className="w-8 h-8 bg-[#0a1628] hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-white/60 mb-2 block">Amount (USDC)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] focus:border-[#3b9dff] rounded-xl py-4 pl-8 pr-4 text-xl font-semibold outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDepositAmount(amount.toString())}
                        className="flex-1 bg-[#0a1628] hover:bg-[#2a4a62] border border-[#2a4a62] rounded-lg py-2 text-sm transition-colors"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a1628] rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Info className="w-4 h-4" />
                    <span>Funds will be deposited directly to your jar on {contractInfo.network}</span>
                  </div>
                </div>

                <button 
                  onClick={handleDeposit}
                  className="w-full bg-[#a8ff00] hover:bg-[#90e000] text-black py-4 rounded-xl font-[family-name:var(--font-pixel)] text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || isTransacting}
                >
                  {isTransacting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Deposit USDC'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && selectedJar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowWithdrawModal(false);
              setWithdrawAmount('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-md w-full border-4 border-[#3b9dff] shadow-[0_0_50px_rgba(59,157,255,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    Withdraw from {selectedJar.name}
                  </h3>
                  <button
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawAmount('');
                    }}
                    className="w-8 h-8 bg-[#0a1628] hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#0a1628] rounded-xl p-4 mb-4">
                  <p className="text-sm text-white/60 mb-1">Available Balance</p>
                  <p className="font-[family-name:var(--font-pixel)] text-2xl text-[#a8ff00]" style={{ imageRendering: 'pixelated' }}>
                    {formatCurrency(selectedJar.current_amount)}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="text-sm text-white/60 mb-2 block">Withdraw Amount (USDC)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      max={selectedJar.current_amount}
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] focus:border-[#3b9dff] rounded-xl py-4 pl-8 pr-4 text-xl font-semibold outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setWithdrawAmount(selectedJar.current_amount.toString())}
                    className="mt-2 text-[#3b9dff] hover:text-white text-sm font-medium transition-colors"
                  >
                    Withdraw All
                  </button>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Instant withdrawal — no lock-up period</span>
                  </div>
                </div>

                <button 
                  onClick={handleWithdraw}
                  className="w-full bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-4 rounded-xl font-[family-name:var(--font-pixel)] text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > selectedJar.current_amount || isTransacting}
                >
                  {isTransacting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Withdraw to Wallet'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Jar Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetCreateModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col border-4 border-[#3b9dff] shadow-[0_0_50px_rgba(59,157,255,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 pb-0">
                <h3 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                  Create New Jar 
                </h3>
                <button
                  onClick={resetCreateModal}
                  className="w-8 h-8 bg-[#0a1628] hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 pt-4">
                <div className="space-y-4">
                  {/* Image Selection */}
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Cover Image</label>
                    <div className="grid grid-cols-3 gap-2">
                      {JAR_IMAGES.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setSelectedImageId(img.id)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageId === img.id 
                              ? 'border-[#3b9dff] ring-2 ring-[#3b9dff]/50' 
                              : 'border-[#2a4a62] hover:border-[#3b9dff]/50'
                          }`}
                        >
                          <Image
                            src={img.src}
                            alt={img.name}
                            fill
                            className="object-cover"
                          />
                          {selectedImageId === img.id && (
                            <div className="absolute inset-0 bg-[#3b9dff]/20 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-[#3b9dff]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Jar Name</label>
                    <input
                      type="text"
                      value={newJarName}
                      onChange={(e) => setNewJarName(e.target.value)}
                      placeholder="e.g., Emergency Fund"
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] focus:border-[#3b9dff] rounded-xl py-3 px-4 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Goal Amount (USDC)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">$</span>
                      <input
                        type="number"
                        value={newJarGoal}
                        onChange={(e) => setNewJarGoal(e.target.value)}
                        placeholder="1000"
                        className="w-full bg-[#0a1628] border-2 border-[#2a4a62] focus:border-[#3b9dff] rounded-xl py-3 pl-8 pr-4 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Target Date (Optional)</label>
                    <input
                      type="date"
                      value={newJarDate}
                      onChange={(e) => setNewJarDate(e.target.value)}
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] focus:border-[#3b9dff] rounded-xl py-3 px-4 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button 
                  onClick={handleCreateJar}
                  disabled={!newJarName || !newJarGoal || isCreating}
                  className="w-full bg-[#a8ff00] hover:bg-[#90e000] text-black py-4 rounded-xl font-[family-name:var(--font-pixel)] text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Jar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
