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
  XCircle,
  Info,
  Loader2,
  Users,
  UserPlus,
  Copy,
  Check,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { useJarsStore, selectTotalSaved, selectTotalGoal } from '@/lib/store/jarsStore';
import { 
  useGroupJarsStore, 
  selectGroupJarTotalSaved, 
  selectGroupJarTotalGoal,
  selectActiveMembers,
  selectPendingWithdrawals 
} from '@/lib/store/groupJarsStore';
import { useProfileStore } from '@/lib/store/profileStore';
import type { Jar, Transaction, GroupJar, GroupJarMember, WithdrawalRequest, GroupJarActivity } from '@/types/database.types';

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
  
  // View state: 'solo' or 'group'
  const [activeView, setActiveView] = useState<'solo' | 'group'>('solo');
  
  // Solo Jar Store
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

  // Group Jar Store
  const { 
    groupJars, 
    selectedGroupJar, 
    members,
    withdrawalRequests,
    activities,
    isLoading: groupJarsLoading, 
    isTransacting: groupIsTransacting,
    fetchGroupJars, 
    createGroupJar, 
    selectGroupJar,
    inviteMember,
    deposit: groupDeposit,
    createWithdrawalRequest,
    approveWithdrawal,
    rejectWithdrawal,
  } = useGroupJarsStore();

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

  // Group Jar specific state
  const [showGroupCreateModal, setShowGroupCreateModal] = useState(false);
  const [showGroupDepositModal, setShowGroupDepositModal] = useState(false);
  const [showGroupWithdrawModal, setShowGroupWithdrawModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groupDepositAmount, setGroupDepositAmount] = useState('');
  const [groupWithdrawAmount, setGroupWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [inviteWallet, setInviteWallet] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock wallet address for demo
  const mockWalletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f5';

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchJars(user.id);
      fetchGroupJars(user.id);
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

  // Group Jar handlers
  const resetGroupCreateModal = () => {
    setShowGroupCreateModal(false);
    setSelectedImageId(JAR_IMAGES[0].id);
    setNewJarName('');
    setNewJarGoal('');
    setNewJarDate('');
  };

  const handleGroupCreateJar = async () => {
    if (!user?.id || !newJarName || !newJarGoal) return;
    
    setIsCreating(true);
    const selectedImage = getSelectedImage();
    const jar = await createGroupJar(user.id, {
      name: newJarName,
      goal_amount: parseFloat(newJarGoal),
      target_date: newJarDate || undefined,
      image_url: selectedImage.src,
      wallet_address: mockWalletAddress,
      display_name: profile?.display_name || undefined,
    });
    
    if (jar) {
      resetGroupCreateModal();
    }
    setIsCreating(false);
  };

  const handleGroupDeposit = async () => {
    if (!user?.id || !selectedGroupJar || !groupDepositAmount) return;
    
    const amount = parseFloat(groupDepositAmount);
    const success = await groupDeposit(user.id, selectedGroupJar.id, amount);
    
    if (success) {
      setShowGroupDepositModal(false);
      setGroupDepositAmount('');
    }
  };

  const handleGroupWithdrawRequest = async () => {
    if (!user?.id || !selectedGroupJar || !groupWithdrawAmount) return;
    
    const amount = parseFloat(groupWithdrawAmount);
    const request = await createWithdrawalRequest(
      selectedGroupJar.id, 
      user.id, 
      amount, 
      mockWalletAddress,
      withdrawReason || undefined
    );
    
    if (request) {
      setShowGroupWithdrawModal(false);
      setGroupWithdrawAmount('');
      setWithdrawReason('');
    }
  };

  const handleInvite = async () => {
    if (!user?.id || !selectedGroupJar || !inviteWallet) return;
    
    const member = await inviteMember(selectedGroupJar.id, inviteWallet, user.id);
    
    if (member) {
      setShowInviteModal(false);
      setInviteWallet('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  // Group Jar selectors
  const groupTotalSaved = selectGroupJarTotalSaved({ 
    groupJars, selectedGroupJar, members, withdrawalRequests, activities, 
    transactions: [], approvals: {}, isLoading: groupJarsLoading, isTransacting: groupIsTransacting, error: null 
  });
  const groupTotalGoal = selectGroupJarTotalGoal({ 
    groupJars, selectedGroupJar, members, withdrawalRequests, activities, 
    transactions: [], approvals: {}, isLoading: groupJarsLoading, isTransacting: groupIsTransacting, error: null 
  });
  const activeMembers = selectActiveMembers({ 
    groupJars, selectedGroupJar, members, withdrawalRequests, activities, 
    transactions: [], approvals: {}, isLoading: groupJarsLoading, isTransacting: groupIsTransacting, error: null 
  });
  const pendingWithdrawals = selectPendingWithdrawals({ 
    groupJars, selectedGroupJar, members, withdrawalRequests, activities, 
    transactions: [], approvals: {}, isLoading: groupJarsLoading, isTransacting: groupIsTransacting, error: null 
  });

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
              <button 
                onClick={() => setActiveView('solo')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === 'solo' 
                    ? 'bg-[#3b9dff] text-white font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-[#1e3a52]'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Puddlejar (Solo)</span>
              </button>
              <button 
                onClick={() => setActiveView('group')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === 'group' 
                    ? 'bg-[#3b9dff] text-white font-semibold' 
                    : 'text-white/60 hover:text-white hover:bg-[#1e3a52]'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Puddlejar (Group)</span>
              </button>
            </div>

            {/* Quick Stats - Show based on active view */}
            {activeView === 'solo' ? (
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
            ) : (
              <div className="bg-[#1e3a52] rounded-xl p-4 mb-6">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                  Group Savings
                </h3>
                <p className="font-[family-name:var(--font-pixel)] text-2xl text-[#3b9dff]" style={{ imageRendering: 'pixelated' }}>
                  {formatCurrency(groupTotalSaved)}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  of {formatCurrency(groupTotalGoal)} goal
                </p>
                <div className="mt-3 bg-[#0a1628] rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#3b9dff] to-[#a8ff00] rounded-full transition-all duration-500"
                    style={{ width: `${getProgress(groupTotalSaved, groupTotalGoal)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Info Card - Show based on active view */}
            {activeView === 'solo' ? (
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
            ) : (
              <div className="bg-[#1e3a52] rounded-xl p-4">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">
                  How It Works
                </h3>
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-[#3b9dff] mt-0.5 flex-shrink-0" />
                    <span>Pool funds with friends</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>2-of-3 approval for withdrawals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wallet className="w-4 h-4 text-[#a8ff00] mt-0.5 flex-shrink-0" />
                    <span>Multi-sig security</span>
                  </div>
                </div>
              </div>
            )}
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
                {activeView === 'solo' ? 'Puddlejar' : 'Group Jar'}
              </h1>
              <p className="text-white/70 text-sm sm:text-base md:text-lg">
                {activeView === 'solo' 
                  ? 'Set goals, save USDC, and withdraw anytime. Your funds, your control.'
                  : 'Pool funds with friends. Withdrawals require 2-of-3 member approval.'
                }
              </p>
            </div>

            {/* Mobile View Toggle */}
            <div className="lg:hidden flex gap-2 mb-6">
              <button
                onClick={() => setActiveView('solo')}
                className={`flex-1 py-3 rounded-lg font-[family-name:var(--font-pixel)] text-sm transition-all ${
                  activeView === 'solo'
                    ? 'bg-[#3b9dff] text-white'
                    : 'bg-[#1e3a52] text-white/60'
                }`}
              >
                Solo
              </button>
              <button
                onClick={() => setActiveView('group')}
                className={`flex-1 py-3 rounded-lg font-[family-name:var(--font-pixel)] text-sm transition-all flex items-center justify-center gap-2 ${
                  activeView === 'group'
                    ? 'bg-[#3b9dff] text-white'
                    : 'bg-[#1e3a52] text-white/60'
                }`}
              >
                <Users className="w-4 h-4" /> Group
              </button>
            </div>

            {/* Solo Jar Content */}
            {activeView === 'solo' && (
              <>
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
              </>
            )}

            {/* Group Jar Content */}
            {activeView === 'group' && (
              <>
                {/* Pending Withdrawal Requests Alert */}
                {pendingWithdrawals.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-yellow-500">Pending Approvals</p>
                        <p className="text-sm text-white/70">
                          You have {pendingWithdrawals.length} withdrawal request(s) waiting for approval
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Create New Group Jar Button */}
                <button
                  onClick={() => setShowGroupCreateModal(true)}
                  className="w-full mb-8 bg-[#1e3a52] hover:bg-[#2a4a62] border-2 border-dashed border-[#3b9dff]/50 hover:border-[#3b9dff] rounded-2xl p-6 transition-all group"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-[#3b9dff]/20 group-hover:bg-[#3b9dff]/30 rounded-xl flex items-center justify-center transition-colors">
                      <Plus className="w-6 h-6 text-[#3b9dff]" />
                    </div>
                    <div className="text-left">
                      <p className="font-[family-name:var(--font-pixel)] text-lg text-[#3b9dff]" style={{ imageRendering: 'pixelated' }}>
                        Create Group Jar
                      </p>
                      <p className="text-sm text-white/60">Start a pooled savings goal with your group</p>
                    </div>
                  </div>
                </button>

                {/* Group Jars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {groupJarsLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-[#3b9dff]" />
                    </div>
                  ) : groupJars.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-white/60">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg mb-2">No group jars yet!</p>
                      <p className="text-sm">Create your first group savings goal to get started.</p>
                    </div>
                  ) : (
                    groupJars.map((jar, index) => (
                      <motion.div
                        key={jar.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#1e3a52] rounded-2xl overflow-hidden border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all cursor-pointer group"
                        onClick={() => selectGroupJar(jar)}
                      >
                        {/* Header with image */}
                        <div className="relative h-32 overflow-hidden">
                          <Image
                            src={jar.image_url || JAR_IMAGES[0].src}
                            alt={jar.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#3b9dff]" />
                            <span className="text-xs">Group</span>
                          </div>
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
                              <p className="text-xs text-white/60 mb-1">Pooled</p>
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
                                selectGroupJar(jar);
                                setShowGroupDepositModal(true);
                              }}
                              className="flex-1 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-2.5 rounded-lg font-[family-name:var(--font-pixel)] text-xs border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                              Deposit
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                selectGroupJar(jar);
                                setShowGroupWithdrawModal(true);
                              }}
                              className="flex-1 bg-[#0a1628] hover:bg-[#1e3a52] text-white py-2.5 rounded-lg font-[family-name:var(--font-pixel)] text-xs border-2 border-[#2a4a62] hover:border-[#3b9dff] transition-all"
                            >
                              Request
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </>
            )}
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

      {/* ============ GROUP JAR MODALS ============ */}

      {/* Group Jar Detail Modal */}
      <AnimatePresence>
        {selectedGroupJar && !showGroupDepositModal && !showGroupWithdrawModal && !showInviteModal && (
          <GroupJarDetailModal
            jar={selectedGroupJar}
            members={members}
            withdrawalRequests={withdrawalRequests}
            activities={activities}
            onClose={() => selectGroupJar(null)}
            onDeposit={() => setShowGroupDepositModal(true)}
            onWithdraw={() => setShowGroupWithdrawModal(true)}
            onInvite={() => setShowInviteModal(true)}
            onApproveWithdrawal={(requestId) => user?.id && approveWithdrawal(requestId, user.id)}
            onRejectWithdrawal={(requestId) => user?.id && rejectWithdrawal(requestId, user.id)}
            formatCurrency={formatCurrency}
            getProgress={getProgress}
            truncateAddress={truncateAddress}
            copyToClipboard={copyToClipboard}
            copiedAddress={copiedAddress}
            currentUserId={user?.id || ''}
          />
        )}
      </AnimatePresence>

      {/* Create Group Jar Modal */}
      <AnimatePresence>
        {showGroupCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetGroupCreateModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-4 border-[#3b9dff]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    Create Group Jar
                  </h2>
                  <button onClick={resetGroupCreateModal} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Preview */}
                <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                  <Image src={getSelectedImage().src} alt={getSelectedImage().name} fill className="object-cover" />
                </div>

                {/* Image Selection */}
                <div className="grid grid-cols-6 gap-2 mb-6">
                  {JAR_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageId(img.id)}
                      className={`relative h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageId === img.id ? 'border-[#3b9dff] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.src} alt={img.name} fill className="object-cover" />
                    </button>
                  ))}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Group Name</label>
                    <input
                      type="text"
                      value={newJarName}
                      onChange={(e) => setNewJarName(e.target.value)}
                      placeholder="e.g., Trip to Japan"
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 focus:border-[#3b9dff] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Goal Amount (USDC)</label>
                    <input
                      type="number"
                      value={newJarGoal}
                      onChange={(e) => setNewJarGoal(e.target.value)}
                      placeholder="e.g., 3000"
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 focus:border-[#3b9dff] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Target Date (Optional)</label>
                    <input
                      type="date"
                      value={newJarDate}
                      onChange={(e) => setNewJarDate(e.target.value)}
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 focus:border-[#3b9dff] outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 bg-[#3b9dff]/10 rounded-lg border border-[#3b9dff]/30">
                  <p className="text-xs text-white/70">
                    <strong className="text-[#3b9dff]">Note:</strong> You&apos;ll be the first member. Invite others after creation. Withdrawals require 2-of-3 approval.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleGroupCreateJar}
                  disabled={isCreating || !newJarName || !newJarGoal}
                  className="w-full mt-6 bg-[#3b9dff] hover:bg-[#2a8ae8] disabled:bg-[#3b9dff]/50 text-white py-3 rounded-lg font-[family-name:var(--font-pixel)] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none disabled:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Create Group Jar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Deposit Modal */}
      <AnimatePresence>
        {showGroupDepositModal && selectedGroupJar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowGroupDepositModal(false);
              setGroupDepositAmount('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-sm w-full border-4 border-[#3b9dff]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    Deposit to {selectedGroupJar.name}
                  </h2>
                  <button onClick={() => { setShowGroupDepositModal(false); setGroupDepositAmount(''); }} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-white/60 mb-2">Current Balance: {formatCurrency(selectedGroupJar.current_amount)}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Amount (USDC)</label>
                  <input
                    type="number"
                    value={groupDepositAmount}
                    onChange={(e) => setGroupDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 text-xl text-center focus:border-[#3b9dff] outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleGroupDeposit}
                  disabled={groupIsTransacting || !groupDepositAmount || parseFloat(groupDepositAmount) <= 0}
                  className="w-full bg-[#3b9dff] hover:bg-[#2a8ae8] disabled:bg-[#3b9dff]/50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {groupIsTransacting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownLeft className="w-4 h-4" />}
                  {groupIsTransacting ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Withdraw Request Modal */}
      <AnimatePresence>
        {showGroupWithdrawModal && selectedGroupJar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowGroupWithdrawModal(false);
              setGroupWithdrawAmount('');
              setWithdrawReason('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-sm w-full border-4 border-[#3b9dff]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    Request Withdrawal
                  </h2>
                  <button onClick={() => { setShowGroupWithdrawModal(false); setGroupWithdrawAmount(''); setWithdrawReason(''); }} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <strong>Note:</strong> Withdrawals require approval from {selectedGroupJar.required_approvals} members before execution.
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-white/60">Available: {formatCurrency(selectedGroupJar.current_amount)}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Amount (USDC)</label>
                    <input
                      type="number"
                      value={groupWithdrawAmount}
                      onChange={(e) => setGroupWithdrawAmount(e.target.value)}
                      max={selectedGroupJar.current_amount}
                      placeholder="0.00"
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 text-xl text-center focus:border-[#3b9dff] outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Reason (Optional)</label>
                    <textarea
                      value={withdrawReason}
                      onChange={(e) => setWithdrawReason(e.target.value)}
                      placeholder="Why do you need these funds?"
                      rows={2}
                      className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 focus:border-[#3b9dff] outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGroupWithdrawRequest}
                  disabled={groupIsTransacting || !groupWithdrawAmount || parseFloat(groupWithdrawAmount) <= 0 || parseFloat(groupWithdrawAmount) > selectedGroupJar.current_amount}
                  className="w-full bg-[#3b9dff] hover:bg-[#2a8ae8] disabled:bg-[#3b9dff]/50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {groupIsTransacting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                  {groupIsTransacting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {showInviteModal && selectedGroupJar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowInviteModal(false);
              setInviteWallet('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1e3a52] rounded-2xl max-w-sm w-full border-4 border-[#3b9dff]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
                    Invite Member
                  </h2>
                  <button onClick={() => { setShowInviteModal(false); setInviteWallet(''); }} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-white/60 mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={inviteWallet}
                    onChange={(e) => setInviteWallet(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[#0a1628] border-2 border-[#2a4a62] rounded-lg px-4 py-3 font-mono text-sm focus:border-[#3b9dff] outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleInvite}
                  disabled={groupIsTransacting || !inviteWallet || inviteWallet.length < 10}
                  className="w-full bg-[#3b9dff] hover:bg-[#2a8ae8] disabled:bg-[#3b9dff]/50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {groupIsTransacting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {groupIsTransacting ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ GROUP JAR DETAIL MODAL COMPONENT ============

interface GroupJarDetailModalProps {
  jar: GroupJar;
  members: GroupJarMember[];
  withdrawalRequests: WithdrawalRequest[];
  activities: GroupJarActivity[];
  onClose: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onInvite: () => void;
  onApproveWithdrawal: (requestId: string) => void;
  onRejectWithdrawal: (requestId: string) => void;
  formatCurrency: (amount: number) => string;
  getProgress: (current: number, goal: number) => number;
  truncateAddress: (address: string) => string;
  copyToClipboard: (text: string) => void;
  copiedAddress: boolean;
  currentUserId: string;
}

function GroupJarDetailModal({
  jar, members, withdrawalRequests, activities,
  onClose, onDeposit, onWithdraw, onInvite,
  onApproveWithdrawal, onRejectWithdrawal,
  formatCurrency, getProgress, truncateAddress,
  copyToClipboard, copiedAddress, currentUserId
}: GroupJarDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'activity'>('members');
  const activeMembers = members.filter(m => m.status === 'active');
  const pendingRequests = withdrawalRequests.filter(r => r.status === 'pending' || r.status === 'approved');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
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
          <Image src={jar.image_url || '/images/features/build.png'} alt={jar.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a52] to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#3b9dff]" />
              <span className="text-xs text-white/70">{activeMembers.length} members</span>
            </div>
            <h3 className="font-[family-name:var(--font-pixel)] text-xl" style={{ imageRendering: 'pixelated' }}>
              {jar.name}
            </h3>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-sm text-white/60 mb-1">Pooled Balance</p>
                <p className="font-[family-name:var(--font-pixel)] text-2xl text-[#3b9dff]" style={{ imageRendering: 'pixelated' }}>
                  {formatCurrency(jar.current_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60 mb-1">Goal</p>
                <p className="text-lg">{formatCurrency(jar.goal_amount)}</p>
              </div>
            </div>
            <div className="bg-[#0a1628] rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3b9dff] to-[#a8ff00] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgress(jar.current_amount, jar.goal_amount)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-center text-sm text-white/60 mt-2">
              {getProgress(jar.current_amount, jar.goal_amount).toFixed(1)}% complete
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button onClick={onDeposit} className="flex-1 bg-[#3b9dff] hover:bg-[#2a8ae8] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <ArrowDownLeft className="w-4 h-4" /> Deposit
            </button>
            <button onClick={onWithdraw} className="flex-1 bg-[#0a1628] hover:bg-[#2a4a62] border-2 border-[#2a4a62] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> Request
            </button>
            <button onClick={onInvite} className="bg-[#0a1628] hover:bg-[#2a4a62] border-2 border-[#2a4a62] text-white p-3 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Contract Address */}
          {jar.contract_address && (
            <div className="mb-6 p-3 bg-[#0a1628] rounded-lg">
              <p className="text-xs text-white/60 mb-1">Contract Address</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">{truncateAddress(jar.contract_address)}</span>
                <button onClick={() => copyToClipboard(jar.contract_address!)} className="p-1 hover:bg-white/10 rounded">
                  {copiedAddress ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-[#2a4a62]">
            {(['members', 'requests', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? 'text-[#3b9dff] border-b-2 border-[#3b9dff]' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab} {tab === 'requests' && pendingRequests.length > 0 && (
                  <span className="ml-1 bg-yellow-500 text-black text-xs px-1.5 rounded-full">{pendingRequests.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'members' && (
              <div className="space-y-2">
                {activeMembers.length === 0 ? (
                  <p className="text-center text-white/60 py-4">No members yet</p>
                ) : (
                  activeMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3b9dff]/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#3b9dff]" />
                        </div>
                        <div>
                          <p className="font-medium">{member.display_name || (member.wallet_address ? truncateAddress(member.wallet_address) : 'Anonymous')}</p>
                          <p className="text-xs text-white/60">{member.wallet_address ? truncateAddress(member.wallet_address) : 'No wallet'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#a8ff00]">{formatCurrency(member.contributed_amount)}</p>
                        <p className="text-xs text-white/60">{member.contribution_percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-white/60 py-4">No pending requests</p>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 bg-[#0a1628] rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{formatCurrency(request.amount)}</p>
                          <p className="text-xs text-white/60">To: {truncateAddress(request.destination_wallet)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          request.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {request.approvals_count}/{jar.required_approvals} approvals
                        </span>
                      </div>
                      {request.reason && <p className="text-sm text-white/70 mb-3">&ldquo;{request.reason}&rdquo;</p>}
                      {request.requester_id !== currentUserId && request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApproveWithdrawal(request.id)}
                            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                          <button
                            onClick={() => onRejectWithdrawal(request.id)}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-2">
                {activities.length === 0 ? (
                  <p className="text-center text-white/60 py-4">No activity yet</p>
                ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 text-sm">
                      <Clock className="w-4 h-4 text-white/40" />
                      <span className="text-white/70">
                        {activity.action_type.replace(/_/g, ' ')}
                        {activity.amount && ` - ${formatCurrency(activity.amount)}`}
                      </span>
                      <span className="text-xs text-white/40 ml-auto">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
