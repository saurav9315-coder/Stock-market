'use client';

import React, { useState } from 'react';
import { COMPANY_BANK_DETAILS, Transaction } from '@/lib/walletMock';
import { 
  Copy, 
  Check, 
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DepositFormProps {
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
}

export default function DepositForm({ onAddTransaction }: DepositFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [method, setMethod] = useState<string>('Bank Transfer');
  const [utr, setUtr] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  // Clipboard copy state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    if (!utr.trim()) {
      toast.error("Please enter a transaction UTR or Reference ID.");
      return;
    }

    onAddTransaction({
      type: 'Deposit',
      amount: Number(amount),
      method,
      utr,
      screenshotUrl: undefined,
      note: note.trim() ? note : `Deposit via ${method}`
    });

    // Reset Form
    setAmount('');
    setUtr('');
    setNote('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Deposit Form (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleSubmit} className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground">Initiate Manual Deposit</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select your transfer method, send funds to our details, and input the transaction ID/UTR.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount & Currency */}
            <div className="space-y-1.5">
              <label htmlFor="amount" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Deposit Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-mono">$</span>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="currency" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="method" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Transfer Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {['Bank Transfer', 'UPI', 'IMPS', 'NEFT', 'RTGS'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`px-2.5 py-2 min-h-[38px] text-[11px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    method === m 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-panel hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* UTR / Transaction ID */}
          <div className="space-y-1.5">
            <label htmlFor="utr" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              UTR / Transaction ID
            </label>
            <div className="relative">
              <input
                id="utr"
                type="text"
                placeholder="Enter 12-digit UTR or Reference ID"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label htmlFor="note" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Payment Note (Optional)
            </label>
            <textarea
              id="note"
              placeholder="Add payment notes, eg: clearing wallet test..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground h-16 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 min-h-[44px] bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Submit Deposit Request
          </button>
        </form>
      </div>

      {/* Company Bank & UPI Details (Right Column) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground">Official Settlement Accounts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Please transfer the exact amount to the following bank account or UPI ID.
            </p>
          </div>

          {/* Render QR code */}
          <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-panel/30 border border-border/30 rounded-lg">
            <div className="relative p-1 bg-[#0b0f19] rounded-lg border border-border/50 shadow-inner overflow-hidden">
              <img 
                src={COMPANY_BANK_DETAILS.qrCodeUrl} 
                alt="UPI Deposit QR Code" 
                className="w-36 h-36 select-none"
              />
            </div>
            <span className="text-[10px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded">
              UPI QR SCANNER
            </span>
          </div>

          {/* Table Details */}
          <div className="space-y-3.5">
            {[
              { label: 'Bank Name', value: COMPANY_BANK_DETAILS.bankName },
              { label: 'Holder Name', value: COMPANY_BANK_DETAILS.holderName },
              { label: 'Account Number', value: COMPANY_BANK_DETAILS.accountNumber, monospace: true },
              { label: 'IFSC Code', value: COMPANY_BANK_DETAILS.ifscCode, monospace: true },
              { label: 'Branch Name', value: COMPANY_BANK_DETAILS.branchName },
              { label: 'UPI ID', value: COMPANY_BANK_DETAILS.upiId, monospace: true },
            ].map((detail) => (
              <div key={detail.label} className="flex items-center justify-between pb-2 border-b border-border/35 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">
                    {detail.label}
                  </span>
                  <span className={`font-semibold text-foreground ${detail.monospace ? 'font-mono' : ''}`}>
                    {detail.value}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(detail.value, detail.label)}
                  className="p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors active:scale-90"
                  aria-label={`Copy ${detail.label}`}
                >
                  {copiedField === detail.label ? (
                    <Check className="w-4 h-4 text-emerald-400 animate-in fade-in zoom-in" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5 p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-lg">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Clearance Rule:</strong> After completing the payment, input your Transaction ID/UTR. Our team will verify it and credit your wallet within 10-30 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
