'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  ShieldAlert,
  UserCheck, 
  User,
  Bell, 
  Settings, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { 
  AdminDatabase, 
  AdminUser, 
  KycSubmission, 
  DepositRequest, 
  WithdrawalRequest,
  ExchangeConfig,
  AdminStock,
  AdminNews,
  AiMetric,
  AiPromptLog,
  PaymentConfiguration,
  AdminSupportTicket,
  SecurityEvent,
  AuditLogEntry,
  SystemSettingsConfig
} from '@/lib/adminMock';

// Import subcomponents
import AdminSidebar from './components/AdminSidebar';
import DashboardView from './components/DashboardView';
import UserManagementView from './components/UserManagementView';
import KycManagementView from './components/KycManagementView';
import FinancialTransactionsView from './components/FinancialTransactionsView';
import MarketsStocksView from './components/MarketsStocksView';
import ContentNewsView from './components/ContentNewsView';
import AiSupportView from './components/AiSupportView';
import SecuritySettingsView from './components/SecuritySettingsView';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Simulated active role
  const [activeRole, setActiveRole] = useState('Super Admin');

  // Database States
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [kyc, setKyc] = useState<KycSubmission[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeConfig[]>([]);
  const [stocks, setStocks] = useState<AdminStock[]>([]);
  const [news, setNews] = useState<AdminNews[]>([]);
  const [aiMetric, setAiMetric] = useState<AiMetric | null>(null);
  const [aiPrompts, setAiPrompts] = useState<AiPromptLog[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfiguration | null>(null);
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig | null>(null);

  // Load database tables from LocalStorage on mount
  useEffect(() => {
    setUsers(AdminDatabase.getUsers());
    setKyc(AdminDatabase.getKycSubmissions());
    setDeposits(AdminDatabase.getDeposits());
    setWithdrawals(AdminDatabase.getWithdrawals());
    setExchanges(AdminDatabase.getExchanges());
    setStocks(AdminDatabase.getStocks());
    setNews(AdminDatabase.getNews());
    setAiMetric(AdminDatabase.getAiMetric());
    setAiPrompts(AdminDatabase.getAiPrompts());
    setPaymentConfig(AdminDatabase.getPaymentConfig());
    setTickets(AdminDatabase.getTickets());
    setSecurityEvents(AdminDatabase.getSecurityEvents());
    setAuditLogs(AdminDatabase.getAuditLogs());
    setSystemSettings(AdminDatabase.getSystemSettings());
    
    const savedRole = AdminDatabase.getSimulatedRole();
    setActiveRole(savedRole);
    
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }

    setHasMounted(true);
  }, []);

  // ------------------------------------------
  // WRITE-BACKS (Sync states to LocalStorage)
  // ------------------------------------------
  const updateUsers = (newUsers: AdminUser[]) => {
    setUsers(newUsers);
    AdminDatabase.setUsers(newUsers);
  };

  const updateKyc = (newKyc: KycSubmission[]) => {
    setKyc(newKyc);
    AdminDatabase.setKycSubmissions(newKyc);
  };

  const updateDeposits = (newDeps: DepositRequest[]) => {
    setDeposits(newDeps);
    AdminDatabase.setDeposits(newDeps);
  };

  const updateWithdrawals = (newWiths: WithdrawalRequest[]) => {
    setWithdrawals(newWiths);
    AdminDatabase.setWithdrawals(newWiths);
  };

  const updateExchanges = (newEx: ExchangeConfig[]) => {
    setExchanges(newEx);
    AdminDatabase.setExchanges(newEx);
  };

  const updateStocks = (newStk: AdminStock[]) => {
    setStocks(newStk);
    AdminDatabase.setStocks(newStk);
  };

  const updateNews = (newNews: AdminNews[]) => {
    setNews(newNews);
    AdminDatabase.setNews(newNews);
  };

  const updateAiPrompts = (newPrompts: AiPromptLog[]) => {
    setAiPrompts(newPrompts);
    AdminDatabase.setAiPrompts(newPrompts);
  };

  const updatePaymentConfig = (newPay: PaymentConfiguration) => {
    setPaymentConfig(newPay);
    AdminDatabase.setPaymentConfig(newPay);
  };

  const updateTickets = (newTick: AdminSupportTicket[]) => {
    setTickets(newTick);
    AdminDatabase.setTickets(newTick);
  };

  const updateSecurityEvents = (newEvents: SecurityEvent[]) => {
    setSecurityEvents(newEvents);
    AdminDatabase.setSecurityEvents(newEvents);
  };

  const updateAuditLogs = (newLogs: AuditLogEntry[]) => {
    setAuditLogs(newLogs);
    AdminDatabase.setAuditLogs(newLogs);
  };

  const updateSystemSettings = (newSys: SystemSettingsConfig) => {
    setSystemSettings(newSys);
    AdminDatabase.setSystemSettings(newSys);
  };

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    AdminDatabase.setSimulatedRole(role);
    toast.info(`Switched Active Role to [${role}]`);
  };

  // Helper to append logs
  const logAction = (action: string) => {
    AdminDatabase.logAction('Staff Operator', activeRole, action);
    // Reload logs
    setAuditLogs(AdminDatabase.getAuditLogs());
  };

  // Permissions config mapping
  const currentPermissions = useMemo<Record<string, boolean>>(() => {
    if (!hasMounted) return {};
    const configs = AdminDatabase.getRoleConfigs();
    const config = configs.find(c => c.role === activeRole);
    return config ? (config.permissions as unknown as Record<string, boolean>) : {};
  }, [activeRole, hasMounted]);

  // Tab Item permission map checking
  useEffect(() => {
    if (!hasMounted) return;
    
    // Map tabs to permissions keys
    const tabPermissions: Record<string, string> = {
      dashboard: 'dashboard',
      users: 'users',
      kyc: 'kyc',
      deposits: 'transactions',
      withdrawals: 'transactions',
      markets: 'markets',
      news: 'news',
      ai: 'ai',
      payments: 'payments',
      support: 'support',
      audit: 'audit',
    };

    const targetKey = tabPermissions[activeTab];
    if (targetKey && currentPermissions[targetKey] === false) {
      setActiveTab('dashboard');
      toast.error(`Permissions Revoked: Dynamic role switching redirected console tab back to executive overview dashboard.`);
    }
  }, [activeRole, currentPermissions, activeTab, hasMounted]);

  // Alert Badge Counts
  const pendingKycCount = useMemo(() => kyc.filter(k => k.status === 'Pending').length, [kyc]);
  const pendingDepositCount = useMemo(() => deposits.filter(d => d.status === 'Pending').length, [deposits]);
  const pendingWithdrawalCount = useMemo(() => withdrawals.filter(w => w.status === 'Pending').length, [withdrawals]);
  const openTicketCount = useMemo(() => tickets.filter(t => t.status === 'Open').length, [tickets]);

  // Renders Loading Spinner during Hydration checks
  if (!hasMounted || loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-wider">Synchronizing System Ledger...</span>
      </div>
    );
  }

  // 403 Forbidden Access Guard: Only ADMIN role accounts are authorized
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-950/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
              HTTP 403 Forbidden
            </span>
            <h2 className="text-lg font-bold text-foreground font-stylish pt-1">Administrative Privileges Required</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account ({user?.email || 'Guest'}) does not possess executive clearance. Normal trader accounts cannot access the executive command desk, view platform ledgers, or approve deposits and withdrawals.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/dashboard"
              className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors text-center"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/login"
              className="flex-1 py-2.5 rounded-xl btn-primary-glow text-xs font-semibold text-white text-center"
            >
              Admin Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-140px)] border border-border rounded-xl bg-background overflow-hidden select-none font-sans min-w-0 max-w-full">
      {/* Sidebar navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        permissions={currentPermissions}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        pendingKycCount={pendingKycCount}
        pendingDepositCount={pendingDepositCount}
        pendingWithdrawalCount={pendingWithdrawalCount}
      />

      {/* Main Panel View Area */}
      <div className="flex-1 flex flex-col h-full bg-card overflow-hidden min-w-0">
        
        {/* Dynamic header / Role selection bar */}
        <div className="min-h-14 bg-card/90 border-b border-border/80 flex flex-wrap items-center justify-between px-3 sm:px-4 gap-2 shrink-0 select-none py-2 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground block leading-none font-sans">
                  System Command Center
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                  SUPERVISOR
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                Operator Clearance: {activeRole}
              </span>
            </div>
          </div>

          {/* Simulator role dropdown switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono shrink-0 hidden sm:inline">
              Simulate Role:
            </span>
            <select
              value={activeRole}
              onChange={e => handleRoleChange(e.target.value)}
              className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground font-mono outline-none cursor-pointer"
            >
              <option value="Super Admin">Super Admin (All Ops)</option>
              <option value="Admin">Admin (Main Desk)</option>
              <option value="Moderator">Moderator (Audits)</option>
              <option value="Support">Support Agent (KYC/Tickets)</option>
              <option value="Finance Manager">Finance Manager (Ledgers)</option>
              <option value="Content Manager">Content Manager (News/Stocks)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Alerts Banner */}
        <AnimatePresence>
          {(pendingKycCount > 0 || pendingDepositCount > 0 || pendingWithdrawalCount > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2 shrink-0 overflow-hidden flex items-center justify-between gap-4 text-xs font-medium"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 flex-1 truncate">
                <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                <span className="truncate">
                  System Alert Checklist:
                  {pendingKycCount > 0 && <span className="ml-2 font-mono font-bold">{pendingKycCount} KYC Pending</span>}
                  {pendingDepositCount > 0 && <span className="ml-2 font-mono font-bold">{pendingDepositCount} Deposit validations</span>}
                  {pendingWithdrawalCount > 0 && <span className="ml-2 font-mono font-bold">{pendingWithdrawalCount} Payout clearings</span>}
                </span>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => {
                    if (pendingKycCount > 0) setActiveTab('kyc');
                    else if (pendingDepositCount > 0) setActiveTab('deposits');
                    else if (pendingWithdrawalCount > 0) setActiveTab('withdrawals');
                  }}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-500 hover:underline flex items-center gap-0.5 cursor-pointer font-mono"
                >
                  Action Queue <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Scrollable Content Panel with Framer Motion slide-fade page transitions */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  users={users}
                  kyc={kyc}
                  deposits={deposits}
                  withdrawals={withdrawals}
                />
              )}

              {activeTab === 'users' && (
                <UserManagementView
                  users={users}
                  setUsers={updateUsers}
                  logAction={logAction}
                  permissions={currentPermissions}
                />
              )}

              {activeTab === 'kyc' && (
                <KycManagementView
                  kyc={kyc}
                  setKyc={updateKyc}
                  users={users}
                  setUsers={updateUsers}
                  logAction={logAction}
                  permissions={currentPermissions}
                />
              )}

              {activeTab === 'deposits' && (
                <FinancialTransactionsView
                  deposits={deposits}
                  setDeposits={updateDeposits}
                  withdrawals={withdrawals}
                  setWithdrawals={updateWithdrawals}
                  users={users}
                  setUsers={updateUsers}
                  logAction={logAction}
                  permissions={currentPermissions}
                  activeTabInit="deposits"
                />
              )}

              {activeTab === 'withdrawals' && (
                <FinancialTransactionsView
                  deposits={deposits}
                  setDeposits={updateDeposits}
                  withdrawals={withdrawals}
                  setWithdrawals={updateWithdrawals}
                  users={users}
                  setUsers={updateUsers}
                  logAction={logAction}
                  permissions={currentPermissions}
                  activeTabInit="withdrawals"
                />
              )}

              {activeTab === 'markets' && (
                <MarketsStocksView
                  exchanges={exchanges}
                  setExchanges={updateExchanges}
                  stocks={stocks}
                  setStocks={updateStocks}
                  logAction={logAction}
                  permissions={currentPermissions}
                />
              )}

              {activeTab === 'news' && (
                <ContentNewsView
                  news={news}
                  setNews={updateNews}
                  logAction={logAction}
                  permissions={currentPermissions}
                />
              )}

              {activeTab === 'ai' && (
                <AiSupportView
                  aiMetric={aiMetric!}
                  aiPrompts={aiPrompts}
                  setAiPrompts={updateAiPrompts}
                  tickets={tickets}
                  setTickets={updateTickets}
                  logAction={logAction}
                  permissions={currentPermissions}
                />
              )}

              {activeTab === 'support' && (
                <AiSupportView
                  aiMetric={aiMetric!}
                  aiPrompts={aiPrompts}
                  setAiPrompts={updateAiPrompts}
                  tickets={tickets}
                  setTickets={updateTickets}
                  logAction={logAction}
                  permissions={currentPermissions}
                  activeTabInit="support"
                />
              )}

              {activeTab === 'payments' && (
                <SecuritySettingsView
                  paymentConfig={paymentConfig!}
                  setPaymentConfig={updatePaymentConfig}
                  securityEvents={securityEvents}
                  setSecurityEvents={updateSecurityEvents}
                  auditLogs={auditLogs}
                  setAuditLogs={updateAuditLogs}
                  systemSettings={systemSettings!}
                  setSystemSettings={updateSystemSettings}
                  logAction={logAction}
                  permissions={currentPermissions}
                />
              )}

              {activeTab === 'audit' && (
                <SecuritySettingsView
                  paymentConfig={paymentConfig!}
                  setPaymentConfig={updatePaymentConfig}
                  securityEvents={securityEvents}
                  setSecurityEvents={updateSecurityEvents}
                  auditLogs={auditLogs}
                  setAuditLogs={updateAuditLogs}
                  systemSettings={systemSettings!}
                  setSystemSettings={updateSystemSettings}
                  logAction={logAction}
                  permissions={currentPermissions}
                  activeTabInit="audit"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
