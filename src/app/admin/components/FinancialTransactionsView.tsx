'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Check, 
  X, 
  CheckCircle2,
  XCircle,
  Clock, 
  Eye, 
  FileText, 
  Coins, 
  ShieldAlert, 
  Building,
  Calendar,
  MessageSquare,
  FileDown
} from 'lucide-react';
import { toast } from 'sonner';
import { DepositRequest, WithdrawalRequest, AdminUser } from '@/lib/adminMock';
import { loadWalletState, saveWalletState, loadTransactions, saveTransactions } from '@/lib/walletMock';

interface FinancialTransactionsViewProps {
  deposits: DepositRequest[];
  setDeposits: (deps: DepositRequest[]) => void;
  withdrawals: WithdrawalRequest[];
  setWithdrawals: (withs: WithdrawalRequest[]) => void;
  users: AdminUser[];
  setUsers: (users: AdminUser[]) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
  activeTabInit?: 'deposits' | 'withdrawals';
}

export default function FinancialTransactionsView({
  deposits,
  setDeposits,
  withdrawals,
  setWithdrawals,
  users,
  setUsers,
  logAction,
  permissions,
  activeTabInit = 'deposits'
}: FinancialTransactionsViewProps) {
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>(activeTabInit);
  
  // Notes / Rejection modal state
  const [depositNotes, setDepositNotes] = useState('');
  const [activeDepositId, setActiveDepositId] = useState<string | null>(null);
  const [depositActionType, setDepositActionType] = useState<'approve' | 'reject'>('approve');
  
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [activeWithdrawalId, setActiveWithdrawalId] = useState<string | null>(null);
  const [withdrawalActionType, setWithdrawalActionType] = useState<'approve' | 'reject' | 'mark_paid'>('approve');
  
  const [zoomedScreenshot, setZoomedScreenshot] = useState<string | null>(null);

  const canModify = permissions.transactions;

  // ------------------------------------------
  // DEPOSIT ACTIONS
  // ------------------------------------------
  const openDepositModal = (id: string, action: 'approve' | 'reject') => {
    if (!canModify) return toast.error('Access Denied: Support role cannot modify financial transactions.');
    setActiveDepositId(id);
    setDepositActionType(action);
    setDepositNotes('');
  };

  const handleDepositActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDepositId) return;

    const deposit = deposits.find(d => d.id === activeDepositId);
    if (!deposit) return;

    if (depositActionType === 'approve') {
      // 1. Mark approved in Admin DB
      const updatedDeps = deposits.map(d => {
        if (d.id === activeDepositId) return { ...d, status: 'Approved' as const, notes: depositNotes || undefined };
        return d;
      });
      setDeposits(updatedDeps);

      // 2. Credit Admin User Wallet Balance
      const updatedUsers = users.map(u => {
        if (u.userId === deposit.userId) {
          return { ...u, walletBalance: u.walletBalance + deposit.amount };
        }
        return u;
      });
      setUsers(updatedUsers);

      // 3. Sync with Investor Wallet state in LocalStorage
      const currentWallet = loadWalletState();
      const newWallet = {
        ...currentWallet,
        availableCash: currentWallet.availableCash + deposit.amount,
        totalBalance: currentWallet.totalBalance + deposit.amount,
        pendingDeposits: Math.max(0, currentWallet.pendingDeposits - deposit.amount)
      };
      saveWalletState(newWallet);

      // 4. Sync Investor Transactions ledger
      const txns = loadTransactions();
      const existingIdx = txns.findIndex(t => t.id === deposit.id || t.utr === deposit.utrNumber);
      if (existingIdx >= 0) {
        txns[existingIdx] = {
          ...txns[existingIdx],
          status: 'Approved',
          note: depositNotes || txns[existingIdx].note
        };
      } else {
        txns.unshift({
          id: deposit.id,
          date: deposit.submittedAt || new Date().toISOString(),
          type: 'Deposit',
          amount: deposit.amount,
          method: deposit.paymentMethod,
          status: 'Approved',
          utr: deposit.utrNumber,
          note: depositNotes || 'Approved by Admin'
        });
      }
      saveTransactions(txns);

      logAction(`ACCEPTED Deposit ${deposit.id} ($${deposit.amount}) for user ${deposit.name}. Credited balance.`);
      toast.success(`Deposit ACCEPTED! Credited $${deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} to user balance.`);
    } else {
      // Reject deposit
      const updatedDeps = deposits.map(d => {
        if (d.id === activeDepositId) return { ...d, status: 'Rejected' as const, notes: depositNotes || 'Rejected by Admin' };
        return d;
      });
      setDeposits(updatedDeps);

      // Sync with Investor Wallet
      const currentWallet = loadWalletState();
      const newWallet = {
        ...currentWallet,
        pendingDeposits: Math.max(0, currentWallet.pendingDeposits - deposit.amount)
      };
      saveWalletState(newWallet);

      // Sync Investor Transactions ledger
      const txns = loadTransactions();
      const existingIdx = txns.findIndex(t => t.id === deposit.id || t.utr === deposit.utrNumber);
      if (existingIdx >= 0) {
        txns[existingIdx] = {
          ...txns[existingIdx],
          status: 'Rejected',
          rejectionReason: depositNotes || 'Verification failed',
          note: depositNotes
        };
      }
      saveTransactions(txns);

      logAction(`REJECTED Deposit ${deposit.id} ($${deposit.amount}) for user ${deposit.name}. Reason: ${depositNotes || 'Verification failed'}`);
      toast.warning(`Deposit REJECTED.`);
    }

    setActiveDepositId(null);
  };

  // ------------------------------------------
  // WITHDRAWAL ACTIONS
  // ------------------------------------------
  const openWithdrawalModal = (id: string, action: 'approve' | 'reject' | 'mark_paid') => {
    if (!canModify) return toast.error('Access Denied: Financial locks are active.');
    setActiveWithdrawalId(id);
    setWithdrawalActionType(action);
    setWithdrawalNotes('');
  };

  const handleWithdrawalActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWithdrawalId) return;

    const withdrawal = withdrawals.find(w => w.id === activeWithdrawalId);
    if (!withdrawal) return;

    const userObj = users.find(u => u.userId === withdrawal.userId);
    
    if (withdrawalActionType === 'approve') {
      // Approve withdrawal request
      const updatedWiths = withdrawals.map(w => {
        if (w.id === activeWithdrawalId) return { ...w, status: 'Approved' as const, notes: withdrawalNotes || undefined };
        return w;
      });
      setWithdrawals(updatedWiths);
      logAction(`Approved Payout Request ${withdrawal.id} of $${withdrawal.amount} for user: ${withdrawal.name}.`);
      toast.success(`Withdrawal Approved. Ready for clearance.`);
    } else if (withdrawalActionType === 'reject') {
      // Reject withdrawal request
      const updatedWiths = withdrawals.map(w => {
        if (w.id === activeWithdrawalId) return { ...w, status: 'Rejected' as const, notes: withdrawalNotes };
        return w;
      });
      setWithdrawals(updatedWiths);
      logAction(`Rejected Payout Request ${withdrawal.id} of $${withdrawal.amount} for user: ${withdrawal.name}. Reason: ${withdrawalNotes}`);
      toast.warning(`Withdrawal request rejected.`);
    } else if (withdrawalActionType === 'mark_paid') {
      // Validate user balance before subtracting
      if (userObj && userObj.walletBalance < withdrawal.amount) {
        return toast.error(`Error: Insufficient User Balance ($${userObj.walletBalance}) to complete withdrawal payout.`);
      }

      // Mark payout as completed (Mark Paid)
      const updatedWiths = withdrawals.map(w => {
        if (w.id === activeWithdrawalId) return { ...w, status: 'Completed' as const, notes: withdrawalNotes || undefined, receiptUrl: 'MockClearedTransactionReceipt' };
        return w;
      });
      setWithdrawals(updatedWiths);

      // Subtract funds from user balance
      const updatedUsers = users.map(u => {
        if (u.userId === withdrawal.userId) {
          return { ...u, walletBalance: u.walletBalance - withdrawal.amount };
        }
        return u;
      });
      setUsers(updatedUsers);

      logAction(`Completed Payout ${withdrawal.id} of $${withdrawal.amount} for user: ${withdrawal.name}. Debited user wallet.`);
      toast.success(`Withdrawal marked as Paid. Debited $${withdrawal.amount} from user balance.`);
    }

    setActiveWithdrawalId(null);
  };

  // Receipt Download Mock
  const downloadReceipt = (withdrawal: WithdrawalRequest) => {
    const receiptText = `
==================================================
STOCKINSIDE TRADING - FINTECH SETTLEMENT RECEIPT
==================================================
Receipt ID: REC-${Math.floor(100000 + Math.random() * 900000)}
Payout Ref ID: ${withdrawal.id}
Date Cleared: ${new Date().toLocaleString()}
Status: COMPLETED (Paid via Bank Transfer)
--------------------------------------------------
CLIENT PROFILE:
User ID: ${withdrawal.userId}
Client Name: ${withdrawal.name}
--------------------------------------------------
PAYMENT DETAILS:
Destination Bank: ${withdrawal.bankName}
Account Holder: ${withdrawal.holderName}
Account Mask: ${withdrawal.accountNumber}
IFSC/SWIFT: ${withdrawal.ifscOrSwift}
--------------------------------------------------
TRANSACTION SUMMARY:
Withdrawal Amount: $${withdrawal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Settlement Fee: $0.00
Net Disbursed: $${withdrawal.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
--------------------------------------------------
AUTHORIZED SIGNATORY:
StockInside Trading Clearing Desk Node
==================================================
`;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Settlement_Receipt_${withdrawal.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction(`Downloaded cleared payout receipt for transaction: ${withdrawal.id}`);
    toast.success('Payout receipt file downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Tab select bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'deposits' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" /> Deposits Queue
          <span className="px-1.5 py-0.5 text-[9px] bg-muted rounded text-muted-foreground font-mono">
            {deposits.filter(d => d.status === 'Pending').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'withdrawals' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" /> Payout Desk
          <span className="px-1.5 py-0.5 text-[9px] bg-muted rounded text-muted-foreground font-mono">
            {withdrawals.filter(w => w.status === 'Pending').length}
          </span>
        </button>
      </div>

      {/* DEPOSITS LIST */}
      {activeTab === 'deposits' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {deposits.length === 0 ? (
            <Card className="bg-panel border-border/80 p-12 text-center text-muted-foreground italic">
              No deposit records exist.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {deposits.map(dep => (
                <Card key={dep.id} className="bg-panel border-border/80 shadow-sm relative overflow-hidden group">
                  {dep.status === 'Pending' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  )}
                  <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* User and UTR */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{dep.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{dep.userId}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{dep.email}</p>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Coins className="w-3.5 h-3.5 text-primary" /> {dep.paymentMethod}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> UTR: <span className="font-mono text-foreground font-bold">{dep.utrNumber}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {new Date(dep.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      {dep.notes && (
                        <p className="text-[10px] text-amber-500 font-medium flex items-center gap-1 mt-1 bg-amber-500/5 p-1 rounded border border-amber-500/10">
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span>Admin Remarks: {dep.notes}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {dep.screenshotUrl && (
                        <div 
                          onClick={() => setZoomedScreenshot(dep.screenshotUrl)}
                          className="w-14 h-14 border border-border rounded overflow-hidden cursor-zoom-in bg-card shrink-0 flex items-center justify-center relative group"
                        >
                          <img src={dep.screenshotUrl} alt="Deposit receipt" className="object-contain w-full h-full p-0.5" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center text-white">
                            <Eye className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      {/* Cash value */}
                      <div className="text-right">
                        <div className="text-base font-bold text-foreground font-mono">
                          ${dep.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <Badge 
                          variant={dep.status === 'Pending' ? 'secondary' : dep.status === 'Approved' ? 'default' : 'destructive'} 
                          className="text-[9px] font-mono py-0 font-bold uppercase tracking-wider mt-1"
                        >
                          {dep.status}
                        </Badge>
                      </div>

                      {/* Controls */}
                      {dep.status === 'Pending' ? (
                        <div className="flex flex-row items-center gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => openDepositModal(dep.id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow cursor-pointer transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openDepositModal(dep.id, 'reject')}
                            className="bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDepositModal(dep.id, dep.status === 'Approved' ? 'reject' : 'approve')}
                          className="text-[10px] font-mono h-7 px-2.5 border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Change to {dep.status === 'Approved' ? 'Rejected' : 'Approved'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WITHDRAWALS LIST */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {withdrawals.length === 0 ? (
            <Card className="bg-panel border-border/80 p-12 text-center text-muted-foreground italic">
              No withdrawal records exist.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {withdrawals.map(wth => (
                <Card key={wth.id} className="bg-panel border-border/80 shadow-sm relative overflow-hidden group">
                  {wth.status === 'Pending' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  )}
                  <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* User and Bank info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{wth.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{wth.userId}</span>
                      </div>
                      
                      {/* Bank Details Container */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-card/60 border border-border/60 rounded px-2.5 py-1.5 text-[11px] text-muted-foreground font-mono mt-1">
                        <span className="flex items-center gap-1 text-foreground font-bold font-sans">
                          <Building className="w-3.5 h-3.5 text-primary" /> {wth.bankName}
                        </span>
                        <span>Acct: <span className="text-foreground">{wth.accountNumber}</span></span>
                        <span>Holder: <span className="text-foreground font-sans font-medium">{wth.holderName}</span></span>
                        <span>IFSC/SWIFT: <span className="text-foreground">{wth.ifscOrSwift}</span></span>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Request: <span className="font-mono text-foreground font-semibold">{new Date(wth.submittedAt).toLocaleString()}</span>
                        </span>
                        {wth.notes && (
                          <span className="text-amber-500 font-medium">Remarks: {wth.notes}</span>
                        )}
                      </div>
                    </div>

                    {/* Cash value */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-base font-bold text-foreground font-mono">
                          ${wth.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <Badge 
                          variant={
                            wth.status === 'Pending' ? 'secondary' : 
                            wth.status === 'Approved' ? 'outline' : 
                            wth.status === 'Completed' ? 'default' : 'destructive'
                          } 
                          className="text-[9px] font-mono py-0 font-bold uppercase tracking-wider mt-1"
                        >
                          {wth.status}
                        </Badge>
                      </div>

                      {/* Controls and Receipt Download */}
                      <div className="flex gap-1.5">
                        {wth.status === 'Pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openWithdrawalModal(wth.id, 'reject')}
                              className="text-bearish border-bearish/30 hover:bg-bearish/10 cursor-pointer p-2 bg-card"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => openWithdrawalModal(wth.id, 'approve')}
                              className="text-primary border-primary/20 hover:bg-primary/5 cursor-pointer text-xs font-semibold px-2.5 bg-card"
                            >
                              Clear Payout
                            </Button>
                          </>
                        )}
                        {wth.status === 'Approved' && (
                          <Button 
                            size="sm" 
                            onClick={() => openWithdrawalModal(wth.id, 'mark_paid')}
                            className="bg-primary text-white font-bold cursor-pointer text-xs px-2.5 shadow"
                          >
                            Mark Paid
                          </Button>
                        )}
                        {wth.status === 'Completed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => downloadReceipt(wth)}
                            className="text-xs gap-1 cursor-pointer bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <FileDown className="w-3.5 h-3.5" /> Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTION REMARKS DIALOG (Shared for Deposits/Withdrawals) */}
      {(activeDepositId || activeWithdrawalId) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={activeDepositId ? handleDepositActionSubmit : handleWithdrawalActionSubmit}
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                {activeDepositId ? (
                  depositActionType === 'approve' ? (
                    <span className="text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Accept Deposit Request</span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Reject Deposit Request</span>
                  )
                ) : (
                  withdrawalActionType === 'approve' ? 'Approve Payout Clearance' : 
                  withdrawalActionType === 'mark_paid' ? 'Disburse Payout Settlement' : 'Reject Payout Request'
                )}
              </h3>
              <button 
                type="button" 
                onClick={() => { setActiveDepositId(null); setActiveWithdrawalId(null); }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {activeDepositId && (
                <div className="p-3 bg-muted/40 border border-border/50 rounded-lg space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User:</span>
                    <span className="font-bold text-foreground">{deposits.find(d => d.id === activeDepositId)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold text-emerald-400 font-mono">${deposits.find(d => d.id === activeDepositId)?.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UTR / Ref:</span>
                    <span className="font-mono text-foreground font-bold">{deposits.find(d => d.id === activeDepositId)?.utrNumber}</span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Add administrative ledger comments or remarks. This audit detail will be recorded in transaction logs.
              </p>
              <textarea
                value={activeDepositId ? depositNotes : withdrawalNotes}
                onChange={e => activeDepositId ? setDepositNotes(e.target.value) : setWithdrawalNotes(e.target.value)}
                placeholder={activeDepositId && depositActionType === 'approve' ? "e.g. Verified bank wire receipt. Credited to account." : "e.g. UTR reference invalid or deposit not received."}
                rows={3}
                className="w-full bg-card border border-border rounded p-2 text-xs text-foreground outline-none resize-none focus:border-primary/50"
              />
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setActiveDepositId(null); setActiveWithdrawalId(null); }} className="cursor-pointer text-xs">
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                className={`font-bold cursor-pointer text-xs ${
                  activeDepositId 
                    ? depositActionType === 'approve' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-primary text-white'
                }`}
              >
                {activeDepositId 
                  ? depositActionType === 'approve' ? 'Confirm Accept' : 'Confirm Reject'
                  : 'Confirm Settlement'
                }
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX OVERLAY */}
      {zoomedScreenshot && (
        <div 
          onClick={() => setZoomedScreenshot(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-h-[85vh] max-w-[85vw] border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-black">
            <img src={zoomedScreenshot} alt="UTR Receipt" className="object-contain max-h-[85vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
