'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  RefreshCw, 
  Download, 
  History, 
  Building2, 
  ShieldCheck, 
  User, 
  Users,
  Lock,
  Activity,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Databases & Persistent storage helpers
import { 
  WalletState, 
  BankAccount, 
  Transaction, 
  loadWalletState, 
  saveWalletState, 
  loadBankAccounts, 
  saveBankAccounts, 
  loadTransactions, 
  saveTransactions 
} from '@/lib/walletMock';

// Subcomponents
import WalletKPIs from './components/WalletKPIs';
import DepositForm from './components/DepositForm';
import WithdrawalForm from './components/WithdrawalForm';
import BankAccountsManager from './components/BankAccountsManager';
import TransactionTable from './components/TransactionTable';

export default function WalletPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Core Data States
  const [wallet, setWallet] = useState<WalletState>({
    totalBalance: 0,
    availableCash: 0,
    investedAmount: 0,
    todayPL: 0,
    todayPLPercent: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kycCompleted, setKycCompleted] = useState<boolean>(false);

  // Load state on mount
  useEffect(() => {
    setMounted(true);
    
    // Simulate loading/skeleton loaders on initial load
    const timer = setTimeout(() => {
      const savedWallet = loadWalletState();
      const savedBanks = loadBankAccounts();
      const savedTransactions = loadTransactions();
      const savedKyc = localStorage.getItem('wallet_kyc_status') === 'true';

      setWallet(savedWallet);
      setBankAccounts(savedBanks);
      setTransactions(savedTransactions);
      setKycCompleted(savedKyc);
      setIsLoadingState(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Sync wallet state automatically when balances change
  const syncWalletState = (updatedWallet: WalletState) => {
    setWallet(updatedWallet);
    saveWalletState(updatedWallet);
  };

  // Push notifications to platform's central alerts ledger if configured
  const addSystemNotification = (title: string, description: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (typeof window === 'undefined') return;
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      description,
      time: 'Just now',
      priority,
      read: false,
      category: 'system' as const
    };
    const saved = localStorage.getItem('triggered_notifications_list');
    let currentNotifs = [];
    if (saved) {
      try {
        currentNotifs = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem('triggered_notifications_list', JSON.stringify([newNotif, ...currentNotifs]));
  };

  // Balance Refresh Simulator
  const handleRefreshBalance = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    toast.info("Syncing wallet ledger with clearing house...");
    
    setTimeout(() => {
      const refreshedWallet = loadWalletState();
      
      // Calculate latest pending balances based on current transactions
      const refreshedTxns = loadTransactions();
      const pendingDepSum = refreshedTxns
        .filter(t => t.type === 'Deposit' && (t.status === 'Pending' || t.status === 'Under Review'))
        .reduce((sum, t) => sum + t.amount, 0);
      const pendingWithSum = refreshedTxns
        .filter(t => t.type === 'Withdrawal' && t.status === 'Pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const updated = {
        ...refreshedWallet,
        pendingDeposits: pendingDepSum,
        pendingWithdrawals: pendingWithSum
      };
      
      syncWalletState(updated);
      setIsRefreshing(false);
      toast.success("Wallet ledger successfully synced!");
    }, 850);
  };

  // Transaction Handlers
  const handleAddTransaction = (newTxnDetails: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    const isDeposit = newTxnDetails.type === 'Deposit';
    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newTxn: Transaction = {
      ...newTxnDetails,
      id: transactionId,
      date: new Date().toISOString(),
      status: isDeposit ? 'Pending' : 'Pending' // withdrawals start as Pending, deposits as Pending
    };

    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    saveTransactions(updatedTxns);

    if (isDeposit) {
      // For deposit, update pending deposits sum
      const newPendingDeposits = wallet.pendingDeposits + newTxn.amount;
      const updatedWallet: WalletState = {
        ...wallet,
        pendingDeposits: newPendingDeposits
      };
      syncWalletState(updatedWallet);
      
      toast.success(`Deposit request of $${newTxn.amount.toLocaleString()} logged. Pending verification.`);
      addSystemNotification(
        "Manual Deposit Submitted",
        `Deposit request for $${newTxn.amount.toLocaleString()} (ID: ${transactionId}) has been submitted for audit. UTR: ${newTxn.utr}`,
        'medium'
      );
    } else {
      // For withdrawal, available balance decreases instantly and goes into pending withdrawals
      const newAvailable = wallet.availableCash - newTxn.amount;
      const newPendingWithdrawals = wallet.pendingWithdrawals + newTxn.amount;
      const updatedWallet: WalletState = {
        ...wallet,
        availableCash: newAvailable,
        pendingWithdrawals: newPendingWithdrawals
      };
      syncWalletState(updatedWallet);

      toast.success(`Withdrawal request of $${newTxn.amount.toLocaleString()} has been placed in processing queue.`);
      addSystemNotification(
        "Withdrawal Request Submitted",
        `Payout of $${newTxn.amount.toLocaleString()} has been submitted. Clearing ticket ID: ${transactionId}`,
        'high'
      );
      
      // Auto-approve withdrawals after 15 seconds for simulation realism!
      setTimeout(() => {
        setTransactions((current) => {
          const matched = current.find(t => t.id === transactionId);
          if (!matched || matched.status !== 'Pending') return current;
          
          const updated = current.map(t => {
            if (t.id === transactionId) {
              return { ...t, status: 'Completed' as const };
            }
            return t;
          });
          saveTransactions(updated);
          
          // Deduct from pending withdrawals and total balance since payout is executed
          setWallet((w) => {
            const nextWallet = {
              ...w,
              pendingWithdrawals: Math.max(0, w.pendingWithdrawals - newTxn.amount),
              totalBalance: Math.max(0, w.totalBalance - newTxn.amount)
            };
            saveWalletState(nextWallet);
            return nextWallet;
          });
          
          toast.success(`Payout processed: $${newTxn.amount.toLocaleString()} credited to bank account.`);
          addSystemNotification(
            "Withdrawal Completed",
            `Your withdrawal of $${newTxn.amount.toLocaleString()} (ID: ${transactionId}) has been cleared by your bank.`,
            'high'
          );
          return updated;
        });
      }, 15000);
    }

    setActiveTab('transactions');
  };

  // KYC Completion Simulator
  const handleCompleteKyc = () => {
    setKycCompleted(true);
    localStorage.setItem('wallet_kyc_status', 'true');
    toast.success("KYC details verified! Bank withdrawals unlocked.");
    addSystemNotification(
      "KYC Verification Completed",
      "Identity verification audit successful. Account status active.",
      'high'
    );
  };

  // Bank Account Handlers
  const handleAddBankAccount = (newBank: Omit<BankAccount, 'id' | 'status'>) => {
    const id = `bank-${Date.now()}`;
    const bankItem: BankAccount = {
      ...newBank,
      id,
      status: 'Pending'
    };
    const updated = [...bankAccounts, bankItem];
    setBankAccounts(updated);
    saveBankAccounts(updated);
  };

  const handleEditBankAccount = (id: string, updatedDetails: Omit<BankAccount, 'id' | 'status'>) => {
    const updated = bankAccounts.map((bank) => {
      if (bank.id === id) {
        return { ...bank, ...updatedDetails };
      }
      return bank;
    });
    setBankAccounts(updated);
    saveBankAccounts(updated);
  };

  const handleDeleteBankAccount = (id: string) => {
    const updated = bankAccounts.filter((bank) => bank.id !== id);
    setBankAccounts(updated);
    saveBankAccounts(updated);
    toast.success("Settlement bank account removed.");
  };

  const handleVerifyBankAccount = (id: string) => {
    const updated = bankAccounts.map((bank) => {
      if (bank.id === id) {
        return { ...bank, status: 'Verified' as const };
      }
      return bank;
    });
    setBankAccounts(updated);
    saveBankAccounts(updated);
  };

  // Admin Approval Handlers
  const handleApproveDeposit = (id: string) => {
    const txn = transactions.find((t) => t.id === id);
    if (!txn) return;

    // Update transaction status
    const updatedTxns = transactions.map((t) => {
      if (t.id === id) {
        return { ...t, status: 'Approved' as const };
      }
      return t;
    });
    setTransactions(updatedTxns);
    saveTransactions(updatedTxns);

    // Credit user's wallet
    const updatedWallet: WalletState = {
      ...wallet,
      totalBalance: wallet.totalBalance + txn.amount,
      availableCash: wallet.availableCash + txn.amount,
      pendingDeposits: Math.max(0, wallet.pendingDeposits - txn.amount)
    };
    syncWalletState(updatedWallet);

    toast.success(`Transaction ${id} approved! $${txn.amount.toLocaleString()} credited to wallet.`);
    addSystemNotification(
      "Deposit Approved",
      `Your manual deposit of $${txn.amount.toLocaleString()} (ID: ${id}) has been approved and credited.`,
      'high'
    );
  };

  const handleRejectDeposit = (id: string, reason: string) => {
    const txn = transactions.find((t) => t.id === id);
    if (!txn) return;

    // Update transaction status
    const updatedTxns = transactions.map((t) => {
      if (t.id === id) {
        return { ...t, status: 'Rejected' as const, rejectionReason: reason };
      }
      return t;
    });
    setTransactions(updatedTxns);
    saveTransactions(updatedTxns);

    // Deduct from pending deposits
    const updatedWallet: WalletState = {
      ...wallet,
      pendingDeposits: Math.max(0, wallet.pendingDeposits - txn.amount)
    };
    syncWalletState(updatedWallet);

    const updated = bankAccounts.map(b => b.id === id ? { ...b, isVerified: true } : b);
    setBankAccounts(updated);
    saveBankAccounts(updated);
    toast.success("Bank account verified successfully!");
  };

  // Render page directly; if not yet loaded from storage, skeleton state is shown
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-foreground min-h-screen pb-16">
      {/* 1. Page Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Treasury & Settlements Desk</h1>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Investor Account
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage manual deposits, request cash out transfers, and audit account transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Balanced Metrics Header summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-panel/30 border border-border/30 rounded-xl p-4">
        {[
          { label: "Wallet Balance", val: wallet.totalBalance },
          { label: "Available Cash", val: wallet.availableCash },
          { label: "Invested Value", val: wallet.investedAmount },
          { label: "Withdrawable", val: wallet.availableCash },
          { label: "Pending Deposits", val: wallet.pendingDeposits, alert: wallet.pendingDeposits > 0 },
          { label: "Pending Payouts", val: wallet.pendingWithdrawals, alert: wallet.pendingWithdrawals > 0 }
        ].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">
              {item.label}
            </span>
            <span className={`text-base font-bold font-mono ${
              item.alert ? 'text-amber-400' : 'text-foreground'
            }`}>
              ${item.val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      {/* 3. Action bar + Tabs row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-panel/20 border-b border-border/20 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 scrollbar-none">
          {[
            { id: 'overview', label: 'Summary', icon: Activity },
            { id: 'deposit', label: 'Deposit Funds', icon: ArrowUpRight },
            { id: 'withdraw', label: 'Withdraw Cash', icon: ArrowDownRight },
            { id: 'banks', label: 'Bank Accounts', icon: Building2 },
            { id: 'transactions', label: 'Ledger History', icon: History }
          ].map((tab) => {
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-panel'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Actions Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshBalance}
            disabled={isRefreshing}
            className="p-2 border border-border bg-panel hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors shrink-0"
            title="Refresh balance ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Tab Views Panel Body Container */}
      <div className="mt-4">
        {isLoadingState ? (
          // Skeleton Loader Screen
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-panel/40 border border-border/20 rounded-xl" />
              ))}
            </div>
            <div className="h-64 bg-panel/30 border border-border/20 rounded-xl" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Tab 1: Overview Summary */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* KPI Cards */}
                  <WalletKPIs metrics={wallet} />
                  
                  {/* Ledger Sneak-Peek & Instructions */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Brief Transactions */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-foreground">Recent Ledger Activities</h3>
                        <button 
                          onClick={() => setActiveTab('transactions')}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          View Full History →
                        </button>
                      </div>
                      <div className="rounded-xl border border-panel-border bg-card overflow-hidden">
                        <div className="p-4 bg-panel/30 border-b border-border/30 font-mono text-[10px] text-muted-foreground flex justify-between">
                          <span>RECENT TRANSACTIONS LOG</span>
                          <span>UPDATED JUST NOW</span>
                        </div>
                        <div className="divide-y divide-border/30 max-h-[220px] overflow-y-auto">
                          {transactions.slice(0, 4).map((t) => (
                            <div key={t.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-panel/10">
                              <div className="flex items-center gap-3">
                                <span className={`p-1.5 rounded-full ${
                                  t.type === 'Deposit' || t.type === 'Bonus' 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                  {t.type === 'Deposit' || t.type === 'Bonus' ? (
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                  ) : (
                                    <ArrowDownRight className="w-3.5 h-3.5" />
                                  )}
                                </span>
                                <div>
                                  <span className="font-bold text-foreground block">{t.type}</span>
                                  <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">{t.id} • {new Date(t.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-foreground font-mono block">${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className={`text-[9px] font-bold font-mono ${
                                  t.status === 'Completed' || t.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  {t.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick guides & Security details */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="rounded-xl border border-panel-border bg-card p-5 space-y-4">
                        <h4 className="text-xs font-bold text-foreground">Security Shield Vault</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Your quantitative trading balances are locked behind multi-stage audit policies. Payout triggers require your 4-digit security PIN and a 6-digit dynamic OTP check.
                        </p>
                        <div className="flex items-center gap-2 p-2 bg-indigo-500/5 border border-indigo-500/15 rounded-lg text-[10px] text-indigo-400 font-semibold font-mono">
                          <Lock className="w-3.5 h-3.5" />
                          TRANSACTION VAULT ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Deposit Funds Form */}
              {activeTab === 'deposit' && (
                <DepositForm onAddTransaction={handleAddTransaction} />
              )}

              {/* Tab 3: Withdrawal Cash Out Form */}
              {activeTab === 'withdraw' && (
                <WithdrawalForm 
                  availableCash={wallet.availableCash}
                  bankAccounts={bankAccounts}
                  onAddTransaction={handleAddTransaction}
                  kycCompleted={kycCompleted}
                  onCompleteKyc={handleCompleteKyc}
                />
              )}

              {/* Tab 4: Bank Account Manager */}
              {activeTab === 'banks' && (
                <BankAccountsManager 
                  accounts={bankAccounts}
                  onAddAccount={handleAddBankAccount}
                  onEditAccount={handleEditBankAccount}
                  onDeleteAccount={handleDeleteBankAccount}
                  onVerifyAccount={handleVerifyBankAccount}
                />
              )}

              {/* Tab 5: Ledger Transaction Table */}
              {activeTab === 'transactions' && (
                <TransactionTable transactions={transactions} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
