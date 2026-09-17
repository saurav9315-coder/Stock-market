import React, { useState } from 'react';
import { BankAccount, Transaction } from '@/lib/walletMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  KeyRound, 
  Smartphone, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  AlertTriangle,
  FileCheck,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalFormProps {
  availableCash: number;
  bankAccounts: BankAccount[];
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  kycCompleted: boolean;
  onCompleteKyc: () => void;
}

export default function WithdrawalForm({ 
  availableCash, 
  bankAccounts, 
  onAddTransaction,
  kycCompleted,
  onCompleteKyc
}: WithdrawalFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  
  // Security Verification flow
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<'pin' | 'otp' | 'password' | 'done'>('pin');
  
  // Inputs for security steps
  const [pinInput, setPinInput] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');

  const activeBank = bankAccounts.find(b => b.id === selectedBankId);

  const handleStartWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kycCompleted) {
      toast.error("KYC verification is required before initiating withdrawals.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (Number(amount) > availableCash) {
      toast.error("Withdrawal amount exceeds available cash balance.");
      return;
    }

    if (!selectedBankId) {
      toast.error("Please select a bank account.");
      return;
    }

    if (activeBank?.status !== 'Verified') {
      toast.error("The selected bank account is not verified yet. Please verify it in the Bank Accounts tab.");
      return;
    }

    // Start verification flow
    setIsVerifying(true);
    setVerificationStep('pin');
    setPinInput('');
    setOtpInput('');
    setPasswordInput('');
    
    // Simulate sending OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setTimeout(() => {
      toast.info(`[Simulation OTP] Your secure withdrawal verification code is: ${mockOtp}`, {
        duration: 8000,
        icon: '💬'
      });
    }, 1200);
  };

  const handleVerifyPin = () => {
    if (pinInput === '4321' || pinInput.length === 4) {
      setVerificationStep('otp');
      toast.success("Security PIN verified.");
    } else {
      toast.error("Invalid transaction PIN. Enter '4321' or any 4 digits to proceed in simulation.");
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp || otpInput === '123456') {
      setVerificationStep('password');
      toast.success("One-Time Password verified.");
    } else {
      toast.error("Invalid OTP code. Please enter the simulated code sent in the top toast notification.");
    }
  };

  const handleVerifyPassword = () => {
    if (passwordInput.length >= 6) {
      setVerificationStep('done');
      
      // Add the withdrawal transaction
      onAddTransaction({
        type: 'Withdrawal',
        amount: Number(amount),
        method: 'Bank Transfer',
        bankAccountMask: `${activeBank?.bankName} (${activeBank?.accountNumber})`,
        note: remarks.trim() ? remarks : "Capital withdraw request"
      });

      // Clear main form
      setAmount('');
      setRemarks('');
      
      setTimeout(() => {
        setIsVerifying(false);
      }, 2000);
    } else {
      toast.error("Password must be at least 6 characters.");
    }
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form inputs */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleStartWithdrawal} className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-foreground">Secure Cash Out Request</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Transfer cash from your available sandbox wallet balance to a verified bank account.
              </p>
            </div>

            {/* KYC Banner Check */}
            {!kycCompleted ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-rose-500/5 border border-rose-500/15">
                <div className="flex gap-3 text-left">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">KYC Verification Required</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Compliance guidelines require identity verification before any funds leave the ecosystem.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onCompleteKyc}
                  className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] font-mono rounded border border-rose-500/20 cursor-pointer transition-colors shrink-0"
                >
                  START KYC VERIFICATION
                </button>
              </div>
            ) : (
              <div className="flex gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-left">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-400">Identity Verified</span>
                  <span className="text-muted-foreground block text-[10px] mt-0.5">
                    Your KYC profile is fully active. Secure trading withdrawals are unlocked.
                  </span>
                </div>
              </div>
            )}

            {/* Withdrawal Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="withdrawAmount" className="font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Withdraw Amount
                </label>
                <span className="text-muted-foreground">
                  Withdrawable Cash: <strong className="text-foreground font-mono font-medium">${availableCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-mono">$</span>
                <input
                  id="withdrawAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                  min="1"
                  max={availableCash}
                  disabled={!kycCompleted}
                  required
                />
              </div>
            </div>

            {/* Bank account picker */}
            <div className="space-y-1.5">
              <label htmlFor="bankSelect" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono block">
                Select Destination Bank Account
              </label>
              {bankAccounts.length === 0 ? (
                <div className="p-3 text-center border border-border/80 bg-panel rounded-lg text-xs text-muted-foreground">
                  No bank accounts configured. Please add one under the "Bank Accounts" tab.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bankAccounts.map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => kycCompleted && setSelectedBankId(bank.id)}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-all flex flex-col justify-between text-left relative overflow-hidden ${
                        !kycCompleted 
                          ? 'opacity-50 cursor-not-allowed'
                          : selectedBankId === bank.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-panel/30 hover:border-border/80'
                      }`}
                    >
                      <div>
                        <span className="text-[11px] font-bold text-foreground block">{bank.bankName}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">{bank.accountNumber}</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[9px] font-medium text-muted-foreground uppercase font-mono">{bank.type} Account</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                          bank.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {bank.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label htmlFor="remarks" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Remarks / Reason for Withdrawal
              </label>
              <input
                id="remarks"
                type="text"
                placeholder="Optional comments for compliance officers..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                disabled={!kycCompleted}
              />
            </div>

            <button
              type="submit"
              disabled={!kycCompleted || bankAccounts.length === 0}
              className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify & Request Withdrawal
            </button>
          </form>
        </div>

        {/* Right Column: Information & Disclaimers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-foreground">Withdrawal Policies</h3>
              <p className="text-xs text-muted-foreground mt-1">Review processing windows, taxes, and daily limits.</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="pb-3 border-b border-border/35 flex justify-between">
                <span className="text-muted-foreground">Daily Limit</span>
                <span className="font-mono font-medium text-foreground">$50,000.00 / day</span>
              </div>
              <div className="pb-3 border-b border-border/35 flex justify-between">
                <span className="text-muted-foreground">Processing Time</span>
                <span className="font-medium text-foreground">1-2 Business Hours</span>
              </div>
              <div className="pb-3 border-b border-border/35 flex justify-between">
                <span className="text-muted-foreground">Transfer Protocols</span>
                <span className="font-medium text-foreground">IMPS / ACH Direct Credit</span>
              </div>
              <div className="pb-1 flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-mono text-emerald-400 font-medium">$0.00 (Zero Fee)</span>
              </div>
            </div>

            <div className="flex gap-2.5 p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-lg text-[11px] text-left">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-foreground block">Verification Notification</span>
                <p className="text-muted-foreground leading-relaxed">
                  Withdrawals will only be credited to bank accounts registered in the profile's legal name (<strong className="text-foreground">Alex Mercer</strong>). Any third-party transfers will be flagged and auto-rejected by compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Drawer Modal */}
      <AnimatePresence>
        {isVerifying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative"
            >
              {verificationStep !== 'done' && (
                <button
                  onClick={() => setIsVerifying(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Step 1: Security PIN */}
              {verificationStep === 'pin' && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Enter Transaction PIN</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Provide your 4-digit security PIN to authorize the transaction.
                    </p>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="• • • •"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-center text-lg rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono tracking-widest"
                      autoFocus
                    />
                    <span className="text-[10px] text-muted-foreground block text-center mt-1">
                      Demo Mode PIN: <strong className="text-foreground">4321</strong>
                    </span>
                  </div>
                  <button
                    onClick={handleVerifyPin}
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Confirm PIN
                  </button>
                </div>
              )}

              {/* Step 2: One-Time Password */}
              {verificationStep === 'otp' && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Confirm One-Time Password</h4>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      We have simulated an OTP sendout to your registered mobile ending in <strong className="text-foreground">**29</strong>.
                    </p>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-center text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono tracking-wider"
                      autoFocus
                    />
                    <span className="text-[10px] text-muted-foreground block text-center mt-1">
                      Check top notification/toast for the generated code.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVerificationStep('pin')}
                      className="w-1/2 py-2 bg-secondary hover:bg-muted text-foreground font-bold text-xs rounded-lg cursor-pointer border border-border"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      className="w-1/2 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Verify OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Password confirmation */}
              {verificationStep === 'password' && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Account Password Check</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Re-enter your account withdrawal password to complete secure transfer.
                    </p>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVerificationStep('otp')}
                      className="w-1/2 py-2 bg-secondary hover:bg-muted text-foreground font-bold text-xs rounded-lg cursor-pointer border border-border"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyPassword}
                      className="w-1/2 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Request Funds
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Verification Success done */}
              {verificationStep === 'done' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Withdrawal Request Logged</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Your payout request of <strong className="text-foreground font-mono">${Number(amount).toLocaleString()}</strong> was logged. Compliance has initiated the verification ticket.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-muted-foreground mt-2">
                    <span>Redirecting back to dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
