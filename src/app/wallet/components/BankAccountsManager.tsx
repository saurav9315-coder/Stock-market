import React, { useState } from 'react';
import { BankAccount } from '@/lib/walletMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  HelpCircle, 
  CreditCard,
  Building,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface BankAccountsManagerProps {
  accounts: BankAccount[];
  onAddAccount: (account: Omit<BankAccount, 'id' | 'status'>) => void;
  onEditAccount: (id: string, updated: Omit<BankAccount, 'id' | 'status'>) => void;
  onDeleteAccount: (id: string) => void;
  onVerifyAccount: (id: string) => void;
}

export default function BankAccountsManager({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onVerifyAccount
}: BankAccountsManagerProps) {
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState<boolean>(false);
  
  // Active states for editing or verifying
  const [activeAccount, setActiveAccount] = useState<BankAccount | null>(null);

  // Form Fields
  const [bankName, setBankName] = useState<string>('');
  const [holderName, setHolderName] = useState<string>('Alex Mercer');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifsc, setIfsc] = useState<string>('');
  const [type, setType] = useState<'Savings' | 'Current'>('Savings');
  
  // Verification input
  const [microDepositInput, setMicroDepositInput] = useState<string>('');
  const [targetDeposit, setTargetDeposit] = useState<string>('0.15');

  const openAddModal = () => {
    setBankName('');
    setAccountNumber('');
    setIfsc('');
    setType('Savings');
    setIsAddOpen(true);
  };

  const openEditModal = (bank: BankAccount) => {
    setActiveAccount(bank);
    setBankName(bank.bankName);
    // Remove masking if editing, or just let them input new
    setAccountNumber(bank.accountNumber.replace(/\*/g, ''));
    setIfsc(bank.ifsc);
    setType(bank.type);
    setIsEditOpen(true);
  };

  const openVerifyModal = (bank: BankAccount) => {
    setActiveAccount(bank);
    // Generate a random deposit amount between 0.10 and 0.99
    const randomAmount = (0.10 + Math.random() * 0.89).toFixed(2);
    setTargetDeposit(randomAmount);
    setMicroDepositInput('');
    setIsVerifyOpen(true);

    // Prompt user with the mock deposit amount
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
    
    // Mask account number for security displays
    const cleanNum = accountNumber.trim();
    const masked = cleanNum.length > 4 ? `******${cleanNum.slice(-4)}` : cleanNum;

    onAddAccount({
      bankName: bankName.trim(),
      holderName,
      accountNumber: masked,
      ifsc: ifsc.trim().toUpperCase(),
      type
    });
    
    setIsAddOpen(false);
    toast.success(`${bankName} account has been logged as PENDING verification.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;
    
    const cleanNum = accountNumber.trim();
    const masked = cleanNum.startsWith('***') ? cleanNum : (cleanNum.length > 4 ? `******${cleanNum.slice(-4)}` : cleanNum);

    onEditAccount(activeAccount.id, {
      bankName: bankName.trim(),
      holderName,
      accountNumber: masked,
      ifsc: ifsc.trim().toUpperCase(),
      type
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
      toast.success(`${activeAccount.bankName} has been successfully VERIFIED! Withdrawals are now unlocked.`);
    } else {
      toast.error("Verification amount mismatch. Check the system notifications toast for the exact amount.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Settlement Bank Accounts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add or verify bank details where cash out requests will be wired.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-3 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Bank Account
        </button>
      </div>

      {/* Account cards grid */}
      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-panel border border-border rounded-full text-muted-foreground">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">No Settlement Accounts Added</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
              Before you can cash out, you need to add your personal bank details.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-secondary text-foreground border border-border font-bold text-[10px] rounded hover:bg-muted transition-colors cursor-pointer"
          >
            Add Settlement Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((bank) => (
            <div
              key={bank.id}
              className="rounded-xl border border-panel-border bg-card p-5 relative overflow-hidden shadow-xs hover:border-border/60 transition-all flex flex-col justify-between min-h-[160px]"
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

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Account Number:</span>
                    <span className="font-mono text-foreground font-semibold">{bank.accountNumber}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">IFSC Code:</span>
                    <span className="font-mono text-foreground font-semibold">{bank.ifsc}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Holder Name:</span>
                    <span className="text-foreground">{bank.holderName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border/30 pt-3 mt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEditModal(bank)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title="Edit Bank Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(bank.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 cursor-pointer transition-colors"
                    title="Delete Bank Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {bank.status === 'Pending' && (
                  <button
                    onClick={() => openVerifyModal(bank)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-500/90 text-white font-bold text-[10px] rounded transition-all cursor-pointer shadow-xs"
                  >
                    Complete Verification
                  </button>
                )}
                {bank.status === 'Verified' && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    READY FOR PAYOUTS
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
                {isAddOpen ? 'Add Settlement Bank Account' : 'Edit Bank Account details'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Enter settlement credentials below. Name matches profile legal identification records.
              </p>

              <form onSubmit={isAddOpen ? handleAddSubmit : handleEditSubmit} className="space-y-4 mt-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={holderName}
                    disabled
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel text-muted-foreground cursor-not-allowed"
                  />
                  <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    Locked to primary identity record: Alex Mercer
                  </span>
                </div>

                <div className="space-y-1.5 text-left">
                  <label htmlFor="bankName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Bank Name
                  </label>
                  <input
                    id="bankName"
                    type="text"
                    placeholder="e.g. Chase Bank, Wells Fargo"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label htmlFor="accountNumber" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Account Number
                  </label>
                  <input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter bank account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="ifsc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Routing / IFSC Code
                    </label>
                    <input
                      id="ifsc"
                      type="text"
                      placeholder="e.g. CHASUS33XXX"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="acType" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                      Account Type
                    </label>
                    <select
                      id="acType"
                      value={type}
                      onChange={(e) => setType(e.target.value as 'Savings' | 'Current')}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer mt-2"
                >
                  {isAddOpen ? 'Register Account' : 'Save Details'}
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
              className="w-full max-w-sm rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsVerifyOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-3.5">
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
                      Please look at the simulated toast notification for the credit amount.
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
