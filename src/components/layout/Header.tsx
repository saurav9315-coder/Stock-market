'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Globe, 
  Clock, 
  Command,
  TrendingUp,
  TrendingDown,
  Menu
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { getAllQuotes } from '@/lib/stockMock';
import { useAuth } from '@/context/AuthContext';

import { useTheme } from 'next-themes';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // searchResults computed via useMemo
  const [nyTime, setNyTime] = useState('');
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clock updates
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      
      // NY Time (Eastern Standard/Daylight Time)
      const nyStr = now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setNyTime(nyStr);

      // UTC Time
      const utcStr = now.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setUtcTime(utcStr);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Theme Toggle handler
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Instant Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const quotes = getAllQuotes();
    return quotes.filter(
      (q) => 
        q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleResultClick = (symbol: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(`/stock/${symbol}`);
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 border-b border-[#1E293B] bg-[#05070A]/85 backdrop-blur-xl sticky top-0 z-40 select-none shadow-lg w-full max-w-full min-w-0">
        
        {/* Left Side: Brand Logo, Mobile Menu, Navigation Links */}
        <div className="flex items-center gap-2 lg:gap-6 min-w-0 shrink">
          {/* Mobile logo indicator & Hamburger menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={onMenuToggle}
              className="p-1.5 rounded-lg hover:bg-[#10161D] text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-[#F4511E]/10 border border-[#F4511E]/30 text-[#F4511E] flex items-center justify-center font-stylish font-bold text-sm shadow-[0_0_10px_rgba(244,81,30,0.2)]">
              AQ
            </div>
          </div>

          {/* Enterprise Logo */}
          <Link href="/" className="hidden md:flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F4511E]/10 border border-[#F4511E]/30 flex items-center justify-center text-[#F4511E] group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(244,81,30,0.2)]">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-[#F8FAFC] font-stylish">
                STOCKINSIDE<span className="text-[#F4511E]">.TRADING</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links (Visible on 2XL screens to preserve header width) */}
          <nav className="hidden 2xl:flex items-center gap-1 font-medium text-xs text-[#94A3B8] shrink">
            <Link href="/markets" className="px-2.5 py-1.5 rounded-lg hover:text-[#F8FAFC] hover:bg-[#10161D] transition-all">Markets</Link>
            <Link href="/trading" className="px-2.5 py-1.5 rounded-lg hover:text-[#F8FAFC] hover:bg-[#10161D] transition-all">Trade</Link>
            <Link href="/trading" className="px-2.5 py-1.5 rounded-lg hover:text-[#F8FAFC] hover:bg-[#10161D] transition-all flex items-center gap-1">
              Futures <span className="text-[9px] px-1 py-0.2 rounded bg-[#F4511E]/15 text-[#F4511E] font-mono">100x</span>
            </Link>
            <Link href="/portfolio" className="px-2.5 py-1.5 rounded-lg hover:text-[#F8FAFC] hover:bg-[#10161D] transition-all">Portfolio</Link>
            <Link href="/screener" className="px-2.5 py-1.5 rounded-lg hover:text-[#F8FAFC] hover:bg-[#10161D] transition-all">Screener</Link>
            <Link href="/ai-analysis" className="px-2.5 py-1.5 rounded-lg hover:text-[#F8FAFC] hover:bg-[#10161D] transition-all">Learn</Link>
          </nav>
        </div>

        {/* Center/Right: Search, Clocks, Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          
          {/* Market Clocks (Visible on 2XL screens to protect header layout) */}
          <div className="hidden 2xl:flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0B0F14] border border-[#1E293B]">
              <Clock className="w-3.5 h-3.5 text-[#F4511E]" />
              <span className="text-[10px] text-[#94A3B8]">NY</span>
              <span className="text-[#F8FAFC] font-medium">{nyTime || '09:30:00'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0B0F14] border border-[#1E293B]">
              <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="text-[10px] text-[#94A3B8]">UTC</span>
              <span className="text-[#F8FAFC] font-medium">{utcTime || '14:30:00'}</span>
            </div>
          </div>

          {/* Quick Search trigger */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-between w-9 sm:w-36 lg:w-48 h-9 px-2 sm:px-3 rounded-xl border border-[#1E293B] bg-[#0B0F14] hover:bg-[#10161D] text-[#94A3B8] hover:text-[#F8FAFC] text-xs transition-all cursor-pointer hover:border-[#F4511E]/40 shadow-inner shrink-0"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#F4511E]" />
              <span className="hidden sm:inline font-sans truncate">Search assets...</span>
            </div>
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#10161D] text-[10px] font-mono border border-[#1E293B] text-[#94A3B8]">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#0B0F14] hover:bg-[#10161D] border border-[#1E293B] hover:border-[#F4511E]/40 transition-all cursor-pointer shrink-0">
              <Bell className="w-4 h-4 text-[#94A3B8] hover:text-[#F8FAFC]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F4511E] shadow-[0_0_6px_#F4511E]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-[#0B0F14] backdrop-blur-md border border-[#1E293B] shadow-2xl rounded-2xl">
              <DropdownMenuLabel className="text-xs font-mono font-semibold flex justify-between items-center text-[#F8FAFC]">
                <span>Alert Notifications</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4511E]/10 text-[#F4511E] font-bold">2 NEW</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1E293B]" />
              <div className="p-3 text-xs space-y-2.5">
                <div className="border-b border-[#1E293B] pb-2.5">
                  <div className="font-semibold text-[#F8FAFC] flex justify-between font-mono">
                    <span>NVDA Breakout</span>
                    <span className="text-[#22C55E] text-[10px] font-bold">+3.20%</span>
                  </div>
                  <p className="text-[#94A3B8] mt-0.5 text-[11px] leading-relaxed">NVIDIA shares hit new intraday record high of $882.40.</p>
                </div>
                <div className="pb-1">
                  <div className="font-semibold text-[#F8FAFC] flex justify-between font-mono">
                    <span>Portfolio Daily P&L</span>
                    <span className="text-[#EF4444] text-[10px] font-bold">-0.40%</span>
                  </div>
                  <p className="text-[#94A3B8] mt-0.5 text-[11px] leading-relaxed">Your equity portfolio is down $124.50 today on Tech pullback.</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#0B0F14] hover:bg-[#10161D] border border-[#1E293B] hover:border-[#F4511E]/40 transition-all cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#F59E0B]" />
            ) : (
              <Moon className="w-4 h-4 text-[#F4511E]" />
            )}
          </button>

          {/* Action CTAs: Login / Sign Up */}
          {!user ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link href="/login" className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-[#F8FAFC] hover:text-[#F4511E] transition-colors">
                Log In
              </Link>
              <Link href="/register" className="btn-primary-glow px-3 sm:px-4 py-1.5 text-xs font-semibold text-white">
                Sign Up
              </Link>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-none group shrink-0">
                <div className="w-8.5 h-8.5 rounded-xl bg-[#F4511E]/10 text-[#F4511E] font-bold border border-[#F4511E]/30 group-hover:border-[#F4511E] flex items-center justify-center text-xs shadow-md font-mono uppercase transition-all">

                  {user ? user.name.slice(0, 2) : 'JD'}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-[#0B0F14] backdrop-blur-md border border-[#1E293B] shadow-2xl rounded-2xl">
                <div className="p-3 bg-[#10161D] rounded-t-2xl">
                  <p className="text-xs font-bold text-[#F8FAFC] truncate font-mono">{user ? user.name : 'Institutional Trader'}</p>
                  <p className="text-[11px] text-[#94A3B8] truncate">{user ? user.email : 'trader@stockinside-trading.com'}</p>
                </div>
                <DropdownMenuSeparator className="bg-[#1E293B]" />
                {(user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN') && (
                  <DropdownMenuItem 
                    className="cursor-pointer text-xs font-bold text-amber-400 focus:text-amber-300 flex items-center justify-between" 
                    onClick={() => router.push('/admin')}
                  >
                    <span>Admin Operations Console</span>
                    <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">ADMIN</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer text-xs font-medium text-[#F8FAFC]" onClick={() => router.push('/settings')}>Institutional Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs font-medium text-[#F8FAFC]" onClick={() => router.push('/settings')}>API Keys & Webhooks</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1E293B]" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-[#EF4444] cursor-pointer font-bold text-xs"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="w-[94vw] sm:w-full max-w-xl bg-popover border border-border p-0 overflow-hidden shadow-2xl rounded-xl">
          <div className="flex items-center border-b border-border px-4 py-3 bg-secondary/35">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              type="text"
              placeholder="Search ticker, company name, or index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm"
              autoFocus
            />
            <div className="px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground border border-border font-mono">
              ESC
            </div>
          </div>
          
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {searchQuery === '' ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Type stock symbol (e.g. AAPL) or company name to search...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No stock assets matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              searchResults.map((result) => {
                const isBullish = result.changePercent >= 0;
                return (
                  <div
                    key={result.symbol}
                    onClick={() => handleResultClick(result.symbol)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-all cursor-pointer border border-transparent hover:border-border/50 mb-1"
                  >
                    <div>
                      <span className="font-bold text-foreground mr-2.5 font-mono">{result.symbol}</span>
                      <span className="text-xs text-muted-foreground">{result.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div className="font-semibold text-foreground text-sm font-mono">${result.price.toLocaleString()}</div>
                      <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                        isBullish ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {isBullish ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                        {isBullish ? '+' : ''}{result.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
