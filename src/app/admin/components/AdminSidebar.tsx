'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Globe, 
  Newspaper, 
  Sparkles, 
  CreditCard, 
  MessageSquare, 
  History, 
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminDatabase } from '@/lib/adminMock';

export interface TabItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey: 'dashboard' | 'users' | 'kyc' | 'transactions' | 'markets' | 'stocks' | 'news' | 'ai' | 'payments' | 'support' | 'audit' | 'security' | 'settings';
}

const tabItems: TabItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, permissionKey: 'dashboard' },
  { id: 'users', name: 'User Directory', icon: Users, permissionKey: 'users' },
  { id: 'kyc', name: 'KYC Operations', icon: FileCheck, permissionKey: 'kyc' },
  { id: 'deposits', name: 'Deposit Ledger', icon: ArrowDownLeft, permissionKey: 'transactions' },
  { id: 'withdrawals', name: 'Withdrawal Desk', icon: ArrowUpRight, permissionKey: 'transactions' },
  { id: 'markets', name: 'Market & Stocks', icon: Globe, permissionKey: 'markets' },
  { id: 'news', name: 'News & Content', icon: Newspaper, permissionKey: 'news' },
  { id: 'ai', name: 'AI & API Audit', icon: Sparkles, permissionKey: 'ai' },
  { id: 'payments', name: 'Security & Assets', icon: CreditCard, permissionKey: 'payments' },
  { id: 'support', name: 'Support Tickets', icon: MessageSquare, permissionKey: 'support' },
  { id: 'audit', name: 'System Logs', icon: History, permissionKey: 'audit' },
];

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  permissions: Record<string, boolean>;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pendingKycCount: number;
  pendingDepositCount: number;
  pendingWithdrawalCount: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  permissions,
  isCollapsed,
  setIsCollapsed,
  pendingKycCount,
  pendingDepositCount,
  pendingWithdrawalCount
}: AdminSidebarProps) {
  
  const getBadgeCount = (tabId: string) => {
    if (tabId === 'kyc') return pendingKycCount;
    if (tabId === 'deposits') return pendingDepositCount;
    if (tabId === 'withdrawals') return pendingWithdrawalCount;
    return 0;
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-auto md:h-full bg-card border-r border-border transition-all duration-300 select-none shrink-0",
        isCollapsed ? "w-14 md:w-16" : "w-56 md:w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && (
          <span className="text-xs font-bold font-mono tracking-widest text-primary uppercase">
            Operations Matrix
          </span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer mx-auto md:mx-0"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex-1 py-4 overflow-y-auto scrollbar-thin px-2 space-y-1">
        {tabItems.map((item) => {
          const hasAccess = !!permissions[item.permissionKey];
          const isActive = activeTab === item.id;
          const badgeCount = getBadgeCount(item.id);

          return (
            <button
              key={item.id}
              disabled={!hasAccess}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group mb-0.5",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md font-semibold" 
                  : hasAccess 
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer" 
                    : "text-muted-foreground/30 cursor-not-allowed opacity-50"
              )}
            >
              {/* Active selection glow border */}
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveGlow"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-foreground rounded"
                />
              )}

              {/* Icon */}
              <div className="relative shrink-0">
                <item.icon className="w-4 h-4" />
                {!hasAccess && (
                  <Lock className="w-2.5 h-2.5 absolute -top-1.5 -right-1.5 text-destructive fill-destructive" />
                )}
              </div>

              {/* Tab Name */}
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">
                  {item.name}
                </span>
              )}

              {/* Badge Counter */}
              {badgeCount > 0 && hasAccess && (
                <div 
                  className={cn(
                    "flex items-center justify-center font-mono rounded-full font-bold leading-none shrink-0",
                    isCollapsed 
                      ? "absolute top-1 right-1 w-4 h-4 text-[9px] bg-bullish text-black" 
                      : "px-1.5 py-0.5 text-[10px] bg-bullish/25 text-bullish border border-bullish/30"
                  )}
                >
                  {badgeCount}
                </div>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-transform duration-100 bg-popover border border-border text-popover-foreground text-xs rounded px-2.5 py-1.5 shadow-lg z-50 whitespace-nowrap font-medium pointer-events-none">
                  {item.name} {!hasAccess && '(Locked)'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border bg-muted/20 text-[10px] text-muted-foreground font-mono text-center">
          Ver: 16.2.9-PROD
        </div>
      )}
    </div>
  );
}
