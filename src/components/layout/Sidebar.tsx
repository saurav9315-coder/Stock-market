'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Globe,
  LineChart, 
  Briefcase, 
  Eye, 
  Newspaper,
  Bell,
  Sparkles,
  Wallet,
  Settings, 
  ShieldCheck,
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  X,
  Fingerprint,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trading Desk', href: '/trading', icon: Zap },
  { name: 'Markets', href: '/markets', icon: Globe },
  { name: 'Stocks', href: '/screener', icon: LineChart },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Watchlist', href: '/watchlist', icon: Eye },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'AI Analysis', href: '/ai-analysis', icon: Sparkles },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Security Center', href: '/security', icon: Fingerprint },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Admin', href: '/admin', icon: ShieldCheck, adminOnly: true },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ isMobileOpen = false, setIsMobileOpen }: SidebarProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  // Sidebar Content rendering
  const renderSidebarContent = (collapsed: boolean, isMobile: boolean) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border overflow-hidden shrink-0 bg-sidebar/80 backdrop-blur-md">
        <Link href="/" onClick={() => isMobile && setIsMobileOpen?.(false)} className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 group-hover:scale-105 transition-all shadow-[0_0_12px_rgba(59,130,246,0.2)] shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="font-bold tracking-tight text-sm text-foreground flex items-center gap-1.5 font-mono">
                StockInsight <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">PRO</span>
              </span>
              <span className="text-[10px] text-blue-400/80 font-stylish font-bold tracking-wider uppercase">Open Account</span>
            </motion.div>
          )}
        </Link>
        {isMobile && (
          <button 
            onClick={() => setIsMobileOpen?.(false)}
            className="p-1 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className={cn("flex-1 px-3 py-5 space-y-1.5 overflow-y-auto scrollbar-thin", isMobile ? "pb-28" : "pb-4")}>
        {visibleNavItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <React.Fragment key={item.name}>
              {idx === 0 && (!collapsed || isMobile) && (
                <div className="px-3 pt-1 pb-1.5 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground/70 uppercase">
                  Terminal
                </div>
              )}
              {idx === 5 && (!collapsed || isMobile) && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground/70 uppercase">
                  Intelligence
                </div>
              )}
              {idx === 9 && (!collapsed || isMobile) && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-mono font-semibold tracking-wider text-muted-foreground/70 uppercase">
                  Control
                </div>
              )}

              <Link 
                href={item.href}
                onClick={() => isMobile && setIsMobileOpen?.(false)}
              >
                <div
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer group mb-0.5",
                    isActive 
                      ? "text-foreground bg-accent/80 border border-primary/40 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-semibold" 
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60 border border-transparent"
                  )}
                >
                  {/* Active Indicator Glow Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-3/5 bg-primary rounded-r shadow-[0_0_8px_#3B82F6]"
                    />
                  )}
                  
                  <item.icon className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  )} />
                  
                  {(!collapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="truncate font-sans"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {/* Collapsed Tooltip */}
                  {collapsed && !isMobile && (
                    <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 bg-popover border border-border text-popover-foreground text-xs rounded-lg px-2.5 py-1.5 shadow-xl z-50 whitespace-nowrap font-mono">
                      {item.name}
                    </div>
                  )}
                </div>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Bottom control (Desktop only) */}
      {!isMobile && (
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors border border-dashed border-sidebar-border cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar wrapper */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: isCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border z-30",
          "shadow-[1px_0_10px_rgba(0,0,0,0.2)] shrink-0"
        )}
      >
        {renderSidebarContent(isCollapsed, false)}
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen?.(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
            />
            {/* Sliding Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 flex flex-col shadow-2xl"
            >
              {renderSidebarContent(false, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
