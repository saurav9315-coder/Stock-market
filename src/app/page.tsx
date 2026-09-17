'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  BrainCircuit, 
  Activity, 
  Layers, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Zap,
  ShieldCheck,
  Smartphone,
  Lock,
  Globe,
  PieChart,
  BarChart3,
  Star,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Menu,
  X
} from 'lucide-react';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import ScrollProgressBar from '@/components/layout/ScrollProgressBar';
import ScrollToTopButton from '@/components/layout/ScrollToTopButton';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

// 8 Enterprise Feature Modules
const featuresList = [
  {
    icon: Zap,
    title: 'Spot Trading Terminal',
    description: 'Ultra-low latency matching engine supporting order book routing and instant execution.',
    badge: 'INSTANT',
    category: 'Trade'
  },
  {
    icon: TrendingUp,
    title: 'Futures & Derivatives Desk',
    description: 'Trade perpetual contracts up to 100x leverage with cross & isolated margin controls.',
    badge: '100x LEVERAGE',
    category: 'Futures'
  },
  {
    icon: BarChart3,
    title: 'TradingView Advanced Charts',
    description: 'Multi-timeframe charting with 100+ technical indicators, drawing tools, and volume overlays.',
    badge: 'PRO TOOLS',
    category: 'Analytics'
  },
  {
    icon: PieChart,
    title: 'Portfolio Analytics Engine',
    description: 'Real-time allocation modeling, risk exposure metrics, and daily benchmark performance tracking.',
    badge: 'REAL-TIME',
    category: 'Portfolio'
  },
  {
    icon: BrainCircuit,
    title: 'Auto-Invest & Quant Bots',
    description: 'Automate dollar-cost averaging and algorithmic grid strategies with automated execution hooks.',
    badge: 'AUTOMATED',
    category: 'Earn'
  },
  {
    icon: Layers,
    title: 'High-Frequency API Trading',
    description: 'REST and WebSocket APIs engineered for algorithmic traders and quantitative hedge funds.',
    badge: 'SUB-2MS API',
    category: 'API'
  },
  {
    icon: Smartphone,
    title: 'Enterprise Mobile App',
    description: 'Full-featured iOS and Android mobile trading experience with instant price push alerts.',
    badge: 'iOS & ANDROID',
    category: 'Mobile'
  },
  {
    icon: ShieldCheck,
    title: 'Institutional Security Core',
    description: 'Multi-party computation (MPC) cold storage, hardware security modules, and 2FA authentication.',
    badge: 'BANK-GRADE',
    category: 'Security'
  },
];

// Onboarding Timeline Steps
const onboardingSteps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up in under 60 seconds with institutional email verification.',
    cta: 'Register Now',
    icon: Lock
  },
  {
    step: '02',
    title: 'Verify Identity',
    description: 'Complete automated instant KYC identity verification with biometrics.',
    cta: 'Learn Compliance',
    icon: ShieldCheck
  },
  {
    step: '03',
    title: 'Deposit Funds',
    description: 'Transfer fiat via SWIFT/ACH or deposit crypto with 0% fee deposit routes.',
    cta: 'View Wallet',
    icon: Zap
  },
  {
    step: '04',
    title: 'Start Trading',
    description: 'Access spot markets, futures desk, and algorithmic quantitative terminals.',
    cta: 'Open Terminal',
    icon: TrendingUp
  },
];

// Demo Tickers Market Data
const initialMarketData = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 91420.50, change: +4.85, volume: '$34.2B', sparkline: [88000, 89200, 88800, 90100, 91420], isCrypto: true, category: 'Futures' },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 3450.20, change: +3.12, volume: '$18.4B', sparkline: [3300, 3380, 3350, 3410, 3450], isCrypto: true, category: 'Futures' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 875.12, change: +3.40, volume: '$14.8B', sparkline: [840, 855, 850, 868, 875], isCrypto: false, category: 'Spot' },
  { symbol: 'SOL/USDT', name: 'Solana', price: 188.60, change: -1.25, volume: '$6.8B', sparkline: [195, 192, 190, 189, 188.6], isCrypto: true, category: 'Futures' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 415.50, change: +1.20, volume: '$8.2B', sparkline: [408, 410, 412, 414, 415.5], isCrypto: false, category: 'Spot' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 182.52, change: -0.40, volume: '$7.4B', sparkline: [185, 184, 183, 183.5, 182.5], isCrypto: false, category: 'Spot' },
  { symbol: 'TSLA', name: 'Tesla Motors', price: 248.90, change: +5.80, volume: '$11.2B', sparkline: [230, 235, 240, 244, 248.9], isCrypto: false, category: 'Spot' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', price: 36.40, change: +2.15, volume: '$1.4B', sparkline: [34.5, 35, 35.8, 36, 36.4], isCrypto: true, category: 'Futures' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Market overview state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>(['BTC/USDT', 'NVDA']);
  const [marketData, setMarketData] = useState(initialMarketData);

  // Simulated live ticker updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => prev.map(item => {
        const delta = (Math.random() - 0.48) * (item.price * 0.003);
        const newPrice = +(item.price + delta).toFixed(2);
        const newSparkline = [...item.sparkline.slice(1), newPrice];
        return {
          ...item,
          price: newPrice,
          sparkline: newSparkline
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
    );
  };

  const filteredMarkets = useMemo(() => {
    return marketData.filter(item => {
      const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || 
                         (selectedCategory === 'Favorites' && favorites.includes(item.symbol)) ||
                         (selectedCategory === 'Gainers' && item.change > 0) ||
                         (selectedCategory === 'Losers' && item.change < 0) ||
                         (selectedCategory === item.category);
      return matchesSearch && matchesCat;
    });
  }, [marketData, searchQuery, selectedCategory, favorites]);

  return (
    <SmoothScrollProvider>
      <ScrollProgressBar />

      <div className="bg-[#040406] min-h-screen text-[#F8FAFC] select-none relative font-sans">
        
        {/* Ambient Dark Orange & Gold Glow behind Hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] max-w-[100vw] h-[550px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D84315]/20 via-[#E65100]/5 to-transparent blur-[140px] pointer-events-none z-0 overflow-hidden" />
        
        {/* Geometric Background Circuit Grid Overlay */}
        <div className="absolute top-0 left-0 right-0 h-[850px] pointer-events-none z-0 opacity-15 overflow-hidden">
          <svg className="w-full h-full text-white/20" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuitGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 2" />
                <circle cx="60" cy="60" r="1.5" fill="#E65100" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuitGrid)" />
            {/* Tech Diagonal Accent Lines */}
            <path d="M -100 200 L 400 700 M 800 -100 L 1400 500" stroke="#E65100" strokeWidth="0.8" opacity="0.4" />
          </svg>
        </div>

        {/* Ticker Tape Marquee Bar */}
        <div className="bg-[#0A0B0E]/90 backdrop-blur-md border-b border-[#1E293B] py-2 overflow-hidden text-xs font-mono relative z-20">
          <div className="ticker-marquee">
            <div className="ticker-marquee-inner">
              {marketData.map((asset, i) => (
                <div key={i} className="flex items-center gap-2 px-6">
                  <span className="font-semibold text-[#F8FAFC]">{asset.symbol}</span>
                  <span className="text-[#94A3B8]">${asset.price.toLocaleString()}</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${asset.change >= 0 ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Glassmorphic Top Header Navigation */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5 flex items-center justify-between relative z-30">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#D84315] to-[#E65100] p-0.5 shadow-[0_0_15px_rgba(216,67,21,0.4)] flex items-center justify-center">
              <div className="w-full h-full bg-[#040406] rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF7043]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white font-stylish group-hover:text-[#FF7043] transition-colors">
                StockInside <span className="font-normal text-zinc-400">Trading</span>
              </span>
            </div>
          </Link>

          {/* Centered Floating Pill Navigation Container (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 nav-glass-pill rounded-full px-7 py-2.5 shadow-2xl">
            <Link href="/" className="text-white font-semibold text-xs sm:text-sm hover:text-[#FF7043] transition-colors">
              Home
            </Link>

            {/* 1. Markets on hover */}
            <Link href="#markets" className="group relative inline-flex items-center justify-center text-xs sm:text-sm font-medium cursor-pointer">
              <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-1 text-zinc-400">
                Markets
              </span>
              <span className="absolute opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-[#FF7043] font-semibold whitespace-nowrap pointer-events-none">
                Spot & Futures
              </span>
            </Link>

            {/* 2. Features on hover */}
            <Link href="#features" className="group relative inline-flex items-center justify-center text-xs sm:text-sm font-medium cursor-pointer">
              <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-1 text-zinc-400">
                Features
              </span>
              <span className="absolute opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-[#FF7043] font-semibold whitespace-nowrap pointer-events-none">
                Quant Terminal
              </span>
            </Link>

            {/* 3. Four Simple Steps on hover */}
            <Link href="#onboarding" className="group relative inline-flex items-center justify-center text-xs sm:text-sm font-medium cursor-pointer">
              <span className="transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-1 text-zinc-400">
                Four Simple Steps
              </span>
              <span className="absolute opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-[#FF7043] font-semibold whitespace-nowrap pointer-events-none">
                Get Started
              </span>
            </Link>
          </nav>

          {/* Right Action Link & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-[#FF7043] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full btn-orange-glow text-xs font-semibold text-white shadow-md hover:scale-105 transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-[#FF7043] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
                >
                  Dashboard
                </Link>
                <Link
                  href="/trading"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 rounded-full btn-orange-glow text-xs font-semibold text-white shadow-md hover:scale-105 transition-all"
                >
                  Trade Now
                </Link>
              </>
            )}
            
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors active:scale-95"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#FF7043]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Slide-Down Drawer Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-b border-[#1E293B] bg-[#07080C]/98 backdrop-blur-2xl px-5 py-4 space-y-4 relative z-40 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col space-y-1.5 font-medium text-sm">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-white hover:bg-white/5 hover:text-[#FF7043] transition-colors font-semibold"
                >
                  Home
                </Link>
                <Link 
                  href="#markets" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-zinc-300 hover:bg-white/5 hover:text-[#FF7043] transition-colors flex items-center justify-between"
                >
                  <span>Markets</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF7043]/10 text-[#FF7043] border border-[#FF7043]/20">Spot & Futures</span>
                </Link>
                <Link 
                  href="#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-zinc-300 hover:bg-white/5 hover:text-[#FF7043] transition-colors flex items-center justify-between"
                >
                  <span>Features</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF7043]/10 text-[#FF7043] border border-[#FF7043]/20">Quant Terminal</span>
                </Link>
                <Link 
                  href="#onboarding" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-zinc-300 hover:bg-white/5 hover:text-[#FF7043] transition-colors flex items-center justify-between"
                >
                  <span>Four Simple Steps</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF7043]/10 text-[#FF7043] border border-[#FF7043]/20">Get Started</span>
                </Link>
              </div>

              <div className="pt-3 border-t border-[#1E293B] flex items-center gap-3">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#1E293B] text-center text-xs font-semibold text-white hover:bg-white/5 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 rounded-xl btn-orange-glow text-center text-xs font-semibold text-white shadow-md transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#1E293B] text-center text-xs font-semibold text-white hover:bg-white/5 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/trading"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 rounded-xl btn-orange-glow text-center text-xs font-semibold text-white shadow-md transition-all"
                    >
                      Trade Now
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="px-3 sm:px-6 lg:px-12 pt-6 sm:pt-10 pb-16 sm:pb-20 max-w-6xl mx-auto relative z-10 text-center space-y-6 sm:space-y-8">
          
          {/* Centered Badge Pill */}
          <div className="flex justify-center px-2 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D84315]/10 border border-[#D84315]/30 text-[#FF5722] text-[10px] sm:text-xs font-mono font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(216,67,21,0.2)] max-w-full">
              <span className="truncate">INSTITUTIONAL QUANTITATIVE TERMINAL</span>
            </div>
          </div>

          {/* Centered Display Headline with Boxed Framing */}
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.18] sm:leading-[1.12] font-stylish max-w-5xl mx-auto break-words px-1">
              Enterprise Trading For <br className="hidden sm:inline" />
              Digital Assets & <span className="boxed-highlight font-normal text-white inline-block">Equities</span> !
            </h1>

            <p className="text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-1 sm:pt-2 px-2 sm:px-0">
              Engineered for high-frequency algorithmic traders and institutional desks. Ultra-low 1.8ms order execution, real-time depth telemetry, and advanced portfolio analytics.
            </p>
          </div>

          {/* Social Proof Stacked Avatars & Metric Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 sm:pt-2 px-2 animate-in fade-in duration-700">
            <div className="flex -space-x-2 sm:-space-x-2.5 overflow-hidden shrink-0">
              <img className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#040406] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Trader 1" />
              <img className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#040406] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Trader 2" />
              <img className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#040406] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Trader 3" />
              <img className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-[#040406] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="Trader 4" />
            </div>
            <div className="text-[11px] sm:text-sm text-center">
              <span className="font-bold text-[#FF5722]">100k+ Active Traders</span> <span className="text-zinc-400">using our quantitative terminals</span>
            </div>
          </div>

          {/* Primary Action CTA Button */}
          <div className="flex justify-center pt-2 sm:pt-3 px-4 animate-in fade-in zoom-in-95 duration-500">
            <Link href="/register" className="w-full sm:w-auto btn-orange-glow px-7 sm:px-9 py-3 sm:py-3.5 text-xs sm:text-base font-semibold flex items-center justify-center gap-2 group cursor-pointer shadow-[0_0_30px_rgba(216,67,21,0.5)]">
              <span>Start Trading Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Terminal Dashboard Preview */}
          <div className="pt-6 sm:pt-10 max-w-5xl mx-auto text-left animate-in fade-in slide-in-from-bottom-6 duration-800">
            <div className="card-elevated p-3.5 sm:p-7 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-[#D84315]/40 bg-[#07080C]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl">
              {/* Top Accent Orange Ambient Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF5722] to-transparent opacity-80" />

              {/* Floating Token Badge */}
              <div className="hidden xs:flex absolute top-2 right-2 sm:-top-3 sm:-right-3 bg-[#0A0B0E] border border-[#D84315]/60 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-mono font-bold text-[#FF5722] shadow-[0_0_20px_rgba(216,67,21,0.3)] items-center gap-1.5 z-20">
                <span className="w-2 h-2 rounded-full bg-[#FF5722] animate-pulse"></span>
                BTC/USDT $91,420
              </div>

              {/* Terminal Dashboard Header Bar */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3.5 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                  <span className="text-xs font-mono text-[#94A3B8] ml-2">antigravity_terminal_v2.4.1</span>
                </div>
                <div className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#D84315]/15 text-[#FF5722] border border-[#D84315]/40 font-semibold shadow-[0_0_10px_rgba(216,67,21,0.2)]">
                  ⚡ SUB-2MS MATCHING ENGINE
                </div>
              </div>

              {/* Live Portfolio & Interactive Area Chart */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 flex flex-col sm:flex-row justify-between sm:items-end gap-3 bg-[#040406] p-4.5 rounded-2xl border border-[#1E293B]">
                    <div>
                      <div className="text-[11px] text-[#94A3B8] font-mono tracking-wider">TOTAL PORTFOLIO VALUE</div>
                      <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F8FAFC] mt-0.5">$124,500.80</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-xs text-[#22C55E] font-bold font-mono flex items-center sm:justify-end gap-1">
                        <ArrowUpRight className="w-4 h-4" /> +$3,420.50 (2.82%)
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono">Past 24 Hours Telemetry</div>
                    </div>
                  </div>

                  {/* Realtime Order Telemetry Widget */}
                  <div className="bg-[#040406] p-4.5 rounded-2xl border border-[#1E293B] flex flex-col justify-between font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#94A3B8]">EXECUTION SPEED</span>
                      <span className="text-[#FF7043] font-bold">1.8ms</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2">
                      <span className="text-[#94A3B8]">ORDER BOOK DEPTH</span>
                      <span className="text-[#22C55E] font-bold">99.98%</span>
                    </div>
                  </div>
                </div>

                {/* Realtime Quant Chart SVG Graphic */}
                <div className="w-full h-52 bg-[#040406] rounded-2xl border border-[#1E293B] p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between text-[11px] font-mono text-[#94A3B8] z-10">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#FF7043]" />
                      NVDA / USD - Realtime Quant Depth
                    </span>
                    <span className="text-[#FF7043] font-bold">Peak High: $882.40</span>
                  </div>

                  <svg className="w-full h-36 text-[#E65100] z-10" viewBox="0 0 400 100" fill="none">
                    <defs>
                      <linearGradient id="quantGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E65100" stopOpacity="0.5" />
                        <stop offset="60%" stopColor="#D84315" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#D84315" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0 80 Q 50 60, 100 70 T 200 40 T 300 50 T 400 10 L 400 100 L 0 100 Z" fill="url(#quantGradient)" />
                    <path d="M0 80 Q 50 60, 100 70 T 200 40 T 300 50 T 400 10" stroke="#FF5722" strokeWidth="2.5" />
                  </svg>

                  <div className="flex justify-between text-[10px] font-mono text-[#64748B] z-10">
                    <span>09:30</span>
                    <span>11:30</span>
                    <span>13:30</span>
                    <span>15:30</span>
                    <span className="text-[#FF7043]">MARKET CLOSE</span>
                  </div>
                </div>

                {/* Mini Order Widgets */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[#040406] rounded-xl border border-[#1E293B] flex items-center justify-between font-mono">
                    <div>
                      <div className="text-[10px] text-[#64748B]">ORDER TYPE</div>
                      <div className="text-xs font-bold text-[#F8FAFC]">LIMIT BUY</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#22C55E] font-bold">$91,000</div>
                      <div className="text-[10px] text-[#94A3B8]">0.50 BTC</div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#040406] rounded-xl border border-[#1E293B] flex items-center justify-between font-mono">
                    <div>
                      <div className="text-[10px] text-[#64748B]">LEVERAGE DESK</div>
                      <div className="text-xs font-bold text-[#FF7043]">20x CROSS</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#FF5722] font-bold">FILLED</div>
                      <div className="text-[10px] text-[#94A3B8]">0.0018s</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* Market Telemetry Section */}
        <section id="markets" className="py-20 bg-[#07080C] border-y border-[#1E293B]/80 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#FF5722] uppercase tracking-wider">REAL-TIME MARKETS</span>
                <h2 className="text-3xl font-bold tracking-tight text-[#F8FAFC] font-stylish mt-1">
                  High-Frequency Market Telemetry
                </h2>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search asset..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#040406] border border-[#1E293B] focus:border-[#FF5722] text-xs font-mono pl-9 pr-3 py-2 rounded-xl text-[#F8FAFC] placeholder:text-[#64748B] outline-none transition-colors w-full sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#040406] p-1 rounded-xl border border-[#1E293B] text-xs font-medium overflow-x-auto scrollbar-none max-w-full">
                  {['All', 'Favorites', 'Spot', 'Futures', 'Gainers', 'Losers'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat ? 'bg-[#D84315]/20 text-[#FF5722] font-semibold border border-[#D84315]/40' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Markets Table */}
            <div className="card-elevated overflow-hidden border-[#1E293B] bg-[#0A0B0E]">
              <div className="w-full overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-sm min-w-[580px] sm:min-w-full">
                  <thead className="bg-[#040406] text-[#94A3B8] font-mono text-xs border-b border-[#1E293B]">
                    <tr>
                      <th className="p-4">Fav</th>
                      <th className="p-4">Asset</th>
                      <th className="p-4 text-right">Price</th>
                      <th className="p-4 text-right">24h Change</th>
                      <th className="p-4 text-right hidden md:table-cell">24h Volume</th>
                      <th className="p-4 text-center hidden sm:table-cell">Mini Chart</th>
                      <th className="p-4 text-right">Trade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-xs font-mono">
                    {filteredMarkets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#94A3B8]">
                          No assets matching query &ldquo;{searchQuery}&rdquo;
                        </td>
                      </tr>
                    ) : (
                      filteredMarkets.map((asset) => {
                        const isFav = favorites.includes(asset.symbol);
                        const isUp = asset.change >= 0;
                        return (
                          <tr key={asset.symbol} className="hover:bg-[#0E1117] transition-colors group">
                            <td className="p-4">
                              <button onClick={(e) => toggleFavorite(asset.symbol, e)} className="text-[#94A3B8] hover:text-[#F59E0B]">
                                <Star className={`w-4 h-4 ${isFav ? 'fill-[#F59E0B] text-[#F59E0B]' : ''}`} />
                              </button>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2.5 font-sans">
                                <div className="w-8 h-8 rounded-lg bg-[#040406] border border-[#1E293B] flex items-center justify-center font-bold text-xs text-[#FF7043]">
                                  {asset.symbol.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-bold text-[#F8FAFC] font-mono">{asset.symbol}</div>
                                  <div className="text-[10px] text-[#94A3B8]">{asset.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right font-bold text-[#F8FAFC]">
                              ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                                isUp ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                              }`}>
                                {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                {isUp ? '+' : ''}{asset.change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="p-4 text-right text-[#94A3B8] hidden md:table-cell">
                              {asset.volume}
                            </td>
                            <td className="p-4 text-center hidden sm:table-cell">
                              <svg className={`w-24 h-6 mx-auto ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`} viewBox="0 0 100 25">
                                <polyline
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  points={asset.sparkline.map((val, idx) => {
                                    const min = Math.min(...asset.sparkline);
                                    const max = Math.max(...asset.sparkline);
                                    const y = 20 - ((val - min) / (max - min || 1)) * 15;
                                    const x = idx * 25;
                                    return `${x},${y}`;
                                  }).join(' ')}
                                />
                              </svg>
                            </td>
                            <td className="p-4 text-right">
                              <Link href="/trading" className="px-3 py-1.5 rounded-lg bg-[#040406] border border-[#1E293B] hover:border-[#FF5722] text-[#F8FAFC] hover:text-[#FF7043] font-sans text-xs font-semibold inline-block transition-colors">
                                Trade
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-12 relative z-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#FF5722] uppercase tracking-wider">ENTERPRISE PLATFORM</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F8FAFC] font-stylish">
              Engineered for Institutional Performance
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Comprehensive quantitative infrastructure built for high-throughput trading and asset management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresList.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="card-elevated p-6 space-y-4 relative group bg-[#0A0B0E] transition-all duration-300 hover:-translate-y-1 hover:border-[#D84315]/50 animate-in fade-in duration-500"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-11 h-11 rounded-xl bg-[#D84315]/10 border border-[#D84315]/30 flex items-center justify-center text-[#FF5722] group-hover:scale-110 transition-transform">
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#040406] border border-[#1E293B] text-[#FF7043]">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#F8FAFC] group-hover:text-[#FF7043] transition-colors">{feat.title}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">{feat.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-xs text-[#FF5722] font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Explore Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Onboarding Visual Timeline Section */}
        <section id="onboarding" className="py-24 bg-[#07080C] border-y border-[#1E293B]/80 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono font-bold text-[#FF5722] uppercase tracking-wider">GET STARTED IN MINUTES</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F8FAFC] font-stylish">
                Seamless Institutional Onboarding
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Four simple steps to unlock spot trading, futures contracts, and algorithmic portfolio models.
              </p>
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {onboardingSteps.map((stepItem, i) => {
                const StepIcon = stepItem.icon;
                return (
                  <div
                    key={i}
                    className="bg-[#040406] border border-[#1E293B] hover:border-[#D84315]/60 p-6 rounded-2xl space-y-4 relative z-10 transition-all duration-300 hover:-translate-y-1 animate-in fade-in duration-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black font-mono text-[#FF5722]">{stepItem.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-[#0A0B0E] border border-[#1E293B] flex items-center justify-center text-[#F8FAFC]">
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#F8FAFC]">{stepItem.title}</h3>
                      <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{stepItem.description}</p>
                    </div>

                    <Link href="/register" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7043] hover:underline pt-2">
                      <span>{stepItem.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-[#FF5722] uppercase tracking-wider">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F8FAFC] font-stylish">
              Got Questions? We Have Answers.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'How fast is order execution on the terminal?', a: 'Orders are processed through our low-latency matching engine in under 1.8 milliseconds with direct WebSocket stream callbacks.' },
              { q: 'What leverage is available for Futures trading?', a: 'Perpetual futures contracts support leverage up to 100x with cross and isolated margin risk management.' },
              { q: 'How does API trading authentication work?', a: 'API access utilizes HMAC-SHA256 signature authorization with strict IP whitelist controls and granular permissions.' },
              { q: 'Is my capital secured?', a: 'Assets are protected using multi-party computation (MPC) cold storage, hardware security modules, and 1:1 reserve proofs.' }
            ].map((faq, idx) => (
              <div key={idx} className="card-elevated p-5 space-y-2 border-[#1E293B] bg-[#0A0B0E]">
                <h3 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#FF5722] shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-xs text-[#94A3B8] pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Enterprise Footer */}
        <Footer />

        <ScrollToTopButton />
      </div>
    </SmoothScrollProvider>
  );
}
