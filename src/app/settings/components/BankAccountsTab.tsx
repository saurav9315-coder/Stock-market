import React, { useState } from 'react';
import { BankAccount } from '@/lib/walletMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Building, 
  AlertCircle,
  X,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

// Define a local type adding upiId (optional, defaults to none)
interface SettingsBankAccount extends BankAccount {
  upiId?: string;
}

interface BankAccountsTabProps {
  accounts: SettingsBankAccount[];
  onAddAccount: (bank: Omit<BankAccount, 'id' | 'status'> & { upiId?: string }) => void;
  onEditAccount: (id: string, updated: Omit<BankAccount, 'id' | 'status'> & { upiId?: string }) => void;
  onDeleteAccount: (id: string) => void;
  onVerifyAccount: (id: string) => void;
}

export default function BankAccountsTab({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onVerifyAccount
}: BankAccountsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
  
  const [activeAccount, setActiveAccount] = useState<SettingsBankAccount | null>(null);

  // Form Fields
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [type, setType] = useState<'Savings' | 'Current'>('Savings');
  
  // Verification input
  const [microDepositInput, setMicroDepositInput] = useState<string>('');
  const [targetDeposit, setTargetDeposit] = useState<string>('0.15');

  const openAddModal = () => {
    setBankName('');
    setAccountNumber('');
    setIfsc('');
    setUpiId('');
    setType('Savings');
    setIsAddOpen(true);
  };

  const openEditModal = (bank: SettingsBankAccount) => {
    setActiveAccount(bank);
    setBankName(bank.bankName);
    setAccountNumber(bank.accountNumber.replace(/\*/g, ''));
    setIfsc(bank.ifsc);
    setUpiId(bank.upiId || '');
    setType(bank.type);
    setIsEditOpen(true);
  };

  const openVerifyModal = (bank: SettingsBankAccount) => {
    setActiveAccount(bank);
    const randomAmount = (0.10 + Math.random() * 0.89).toFixed(2);
    setTargetDeposit(randomAmount);
    setMicroDepositInput('');
    setIsVerifyOpen(true);

    setTimeout(() => {
      toast.info(`[Simulation Feed] Micro-deposit of $${randomAmount} was credited to your ${bank.bankName} account.`, {
        duration: 8000,
        icon: '💰'
      });
    }, 1000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !ifsc.trim()) {
      toast.error("Please fill in all bank details.");
      return;
    }
    
    const cleanNum = accountNumber.trim();
    const masked = cleanNum.length > 4 ? `******${cleanNum.slice(-4)}` : cleanNum;

    onAddAccount({
      bankName: bankName.trim(),
      holderName: "Alex Mercer",
      accountNumber: masked,
      ifsc: ifsc.trim().toUpperCase(),
      type,
      upiId: upiId.trim() ? upiId.trim() : `${profileUpiSeed(bankName)}`
    });
    
    setIsAddOpen(false);
    toast.success(`${bankName} account logged as PENDING verification.`);
  };

  const profileUpiSeed = (bank: string) => {
    const clean = bank.toLowerCase().replace(/\s/g, '');
    return `alexmercer@${clean || 'ybl'}`;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;
    
    const cleanNum = accountNumber.trim();
    const masked = cleanNum.startsWith('***') ? cleanNum : (cleanNum.length > 4 ? `******${cleanNum.slice(-4)}` : cleanNum);

    onEditAccount(activeAccount.id, {
      bankName: bankName.trim(),
      holderName: "Alex Mercer",
      accountNumber: masked,
      ifsc: ifsc.trim().toUpperCase(),
      type,
      upiId: upiId.trim()
    });

    setIsEditOpen(false);
    toast.success("Bank details updated successfully.");
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;

    if (Number(microDepositInput).toFixed(2) === targetDeposit) {
      onVerifyAccount(activeAccount.id);
      setIsVerifyOpen(false);
      toast.success(`${activeAccount.bankName} account verified successfully!`);
    } else {
      toast.error("Verification amount mismatch. Check console notifications.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Settlement & Verification Banks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage personal checking or savings accounts linked to your wallet desk.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-panel border border-border rounded-full text-muted-foreground">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">No Banks Configured</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
              Before requesting cash outs, link a personal account.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map((bank) => (
            <div
              key={bank.id}
              className="rounded-xl border border-panel-border bg-card p-5 relative overflow-hidden shadow-xs hover:border-border/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded bg-panel border border-border text-indigo-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{bank.bankName}</h4>
                      <span className="text-[9px] font-medium font-mono text-muted-foreground uppercase">{bank.type} ACCOUNT</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    bank.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {bank.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-[11px] border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-mono text-foreground font-semibold">{bank.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-b border-border/10 pb-1.5">
                    <span className="text-muted-foreground">IFSC / Route Code:</span>
                    <span className="font-mono text-foreground font-semibold">{bank.ifsc}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">UPI ID Address:</span>
                    <span className="font-mono text-foreground font-semibold">{bank.upiId || `alexmercer@${bank.bankName.toLowerCase().replace(/\s/g, '')}`}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border/30 pt-3.5 mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(bank)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(bank.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bank.status === 'Pending' && (
                  <button
                    onClick={() => openVerifyModal(bank)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-500/90 text-white font-bold text-[10px] rounded transition-all cursor-pointer shadow-xs"
                  >
                    Verify
                  </button>
                )}
                {bank.status === 'Verified' && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    ACTIVE
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add & Edit Modal Overlay */}
      <AnimatePresence>
        {(isAddOpen || isEditOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative"
            >
              <button
                onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}
                className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-foreground">
                {isAddOpen ? 'Link New Bank Account' : 'Edit Bank Credentials'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Enter settlement coordinates below. Accounts must be registered under Alex Mercer.
              </p>

              <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4 mt-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="bankName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    placeholder="e.g. Bank of America"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="accountNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Account Number
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="ifsc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Routing / IFSC Code
                    </label>
                    <input
                      id="ifsc"
                      type="text"
                      placeholder="e.g. BOFAUS3NXXX"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="acType" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Account Type
                    </label>
                    <select
                      id="acType"
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="upiId" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    UPI ID (Optional)
                  </label>
                  <input
                    id="upiId"
                    type="text"
                    placeholder="e.g. name@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer mt-2"
                >
                  {isAddOpen ? 'Link Account' : 'Save Details'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Micro-Deposit Verification Modal */}
        {isVerifyOpen && activeAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative text-center"
            >
              <button
                onClick={() => setIsVerifyOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-3.5">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Micro-Deposit Verification</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Verify account ownership. We have credited a small micro-deposit (under $1.00) to <strong className="text-foreground">{activeAccount.bankName}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Enter Deposit Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-muted-foreground font-mono">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={microDepositInput}
                        onChange={(e) => setMicroDepositInput(e.target.value)}
                        className="w-full pl-6 pr-3 py-1.5 text-xs rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground block leading-tight mt-1 text-center">
                      Please check system notifications for the exact credited value.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-500/90 text-white font-bold text-xs rounded-lg cursor-pointer shadow-sm"
                  >
                    Confirm Deposit Verification
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
