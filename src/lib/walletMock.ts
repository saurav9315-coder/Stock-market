export interface WalletState {
  totalBalance: number;
  availableCash: number;
  investedAmount: number;
  todayPL: number;
  todayPLPercent: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifsc: string;
  type: 'Savings' | 'Current';
  status: 'Pending' | 'Verified';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Deposit' | 'Withdrawal' | 'Buy Stock' | 'Sell Stock' | 'Refund' | 'Bonus';
  amount: number;
  method: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Completed';
  utr?: string;
  screenshotUrl?: string;
  note?: string;
  bankAccountMask?: string;
  rejectionReason?: string;
}

export interface CompanyBankDetail {
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
  qrCodeUrl: string;
}

// Gorgeous tech-themed SVG QR Code base64 data URI
export const COMPANY_QR_CODE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200" style="background:%230b0f19;padding:12px;border-radius:12px;border:1px solid %231f2937;"><rect width="100%" height="100%" fill="%230b0f19"/><rect x="10" y="10" width="24" height="24" fill="%236366f1" rx="3"/><rect x="14" y="14" width="16" height="16" fill="%230b0f19"/><rect x="17" y="17" width="10" height="10" fill="%236366f1" rx="1.5"/><rect x="66" y="10" width="24" height="24" fill="%236366f1" rx="3"/><rect x="70" y="14" width="16" height="16" fill="%230b0f19"/><rect x="73" y="17" width="10" height="10" fill="%236366f1" rx="1.5"/><rect x="10" y="66" width="24" height="24" fill="%236366f1" rx="3"/><rect x="14" y="70" width="16" height="16" fill="%230b0f19"/><rect x="17" y="73" width="10" height="10" fill="%236366f1" rx="1.5"/><rect x="42" y="10" width="16" height="8" fill="%2310b981" rx="1.5"/><rect x="42" y="24" width="8" height="10" fill="%236366f1" rx="1.5"/><rect x="10" y="42" width="8" height="16" fill="%2310b981" rx="1.5"/><rect x="24" y="42" width="10" height="8" fill="%236366f1" rx="1.5"/><rect x="42" y="42" width="16" height="16" fill="%2310b981" rx="2"/><rect x="70" y="42" width="12" height="12" fill="%236366f1" rx="2"/><rect x="42" y="66" width="8" height="24" fill="%2310b981" rx="1.5"/><rect x="56" y="66" width="16" height="8" fill="%236366f1" rx="1.5"/><rect x="78" y="66" width="12" height="12" fill="%2310b981" rx="2"/><rect x="66" y="82" width="12" height="8" fill="%236366f1" rx="1.5"/><rect x="82" y="82" width="8" height="8" fill="%2310b981" rx="1"/><rect x="44" y="44" width="12" height="12" fill="%230b0f19" rx="2"/><circle cx="50" cy="50" r="3" fill="%236366f1"/></svg>`;

export const COMPANY_BANK_DETAILS: CompanyBankDetail = {
  bankName: "Antigravity Clearing Corp Bank",
  holderName: "Antigravity Trading Sandbox LLP",
  accountNumber: "99881122003344",
  ifscCode: "ANTIGRAV00099",
  branchName: "Bengaluru Tech HQ",
  upiId: "antigravity@ybl",
  qrCodeUrl: COMPANY_QR_CODE,
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "bank-1",
    bankName: "Bank of America",
    holderName: "Alex Mercer",
    accountNumber: "******8829",
    ifsc: "BOFAUS3NXXX",
    type: "Savings",
    status: "Verified",
  },
  {
    id: "bank-2",
    bankName: "Chase Bank",
    holderName: "Alex Mercer",
    accountNumber: "******3394",
    ifsc: "CHASUS33XXX",
    type: "Current",
    status: "Verified",
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-902341",
    date: "2026-07-01T10:15:00Z",
    type: "Deposit",
    amount: 15000.00,
    method: "Bank Transfer",
    status: "Completed",
    utr: "UTR882910482910",
    note: "Initial sandbox capitalization",
  },
  {
    id: "TXN-902342",
    date: "2026-07-02T14:30:00Z",
    type: "Buy Stock",
    amount: 2628.00,
    method: "Wallet",
    status: "Completed",
    note: "Purchased 15 AAPL shares",
  },
  {
    id: "TXN-902343",
    date: "2026-07-02T14:35:00Z",
    type: "Buy Stock",
    amount: 3120.80,
    method: "Wallet",
    status: "Completed",
    note: "Purchased 8 MSFT shares",
  },
  {
    id: "TXN-902344",
    date: "2026-07-03T09:45:00Z",
    type: "Buy Stock",
    amount: 3250.00,
    method: "Wallet",
    status: "Completed",
    note: "Purchased 5 NVDA shares",
  },
  {
    id: "TXN-902345",
    date: "2026-07-03T11:15:00Z",
    type: "Buy Stock",
    amount: 2344.80,
    method: "Wallet",
    status: "Completed",
    note: "Purchased 12 TSLA shares",
  },
  {
    id: "TXN-902346",
    date: "2026-07-04T16:00:00Z",
    type: "Buy Stock",
    amount: 8700.00,
    method: "Wallet",
    status: "Completed",
    note: "Purchased 0.15 BTC-USD",
  },
  {
    id: "TXN-902347",
    date: "2026-07-05T08:30:00Z",
    type: "Bonus",
    amount: 7.80,
    method: "System Credit",
    status: "Completed",
    note: "AAPL Dividend payout credit",
  },
  {
    id: "TXN-902348",
    date: "2026-07-06T12:00:00Z",
    type: "Withdrawal",
    amount: 500.00,
    method: "Bank Transfer",
    status: "Completed",
    bankAccountMask: "Bank of America (******8829)",
    note: "Cash out to primary account",
  },
  {
    id: "TXN-902349",
    date: "2026-07-07T08:45:00Z",
    type: "Refund",
    amount: 120.00,
    method: "Wallet",
    status: "Completed",
    note: "Reversal of indicator subscription fee",
  },
  {
    id: "TXN-902350",
    date: "2026-07-08T17:10:00Z",
    type: "Bonus",
    amount: 50.00,
    method: "Promo Credit",
    status: "Completed",
    note: "Beta tester appreciation bonus",
  },
];

export const INITIAL_WALLET_STATE: WalletState = {
  totalBalance: 72500.50,
  availableCash: 18240.50,
  investedAmount: 54260.00,
  todayPL: 1240.20,
  todayPLPercent: 1.74,
  pendingDeposits: 0.00,
  pendingWithdrawals: 0.00,
};

// LocalStorage helpers
export const loadWalletState = (): WalletState => {
  if (typeof window === 'undefined') return INITIAL_WALLET_STATE;
  const saved = localStorage.getItem('wallet_state_data');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse wallet state", e);
    }
  }
  // Initialize if not present
  localStorage.setItem('wallet_state_data', JSON.stringify(INITIAL_WALLET_STATE));
  return INITIAL_WALLET_STATE;
};

export const saveWalletState = (state: WalletState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wallet_state_data', JSON.stringify(state));
};

export const loadBankAccounts = (): BankAccount[] => {
  if (typeof window === 'undefined') return INITIAL_BANK_ACCOUNTS;
  const saved = localStorage.getItem('wallet_bank_accounts');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse bank accounts", e);
    }
  }
  localStorage.setItem('wallet_bank_accounts', JSON.stringify(INITIAL_BANK_ACCOUNTS));
  return INITIAL_BANK_ACCOUNTS;
};

export const saveBankAccounts = (accounts: BankAccount[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wallet_bank_accounts', JSON.stringify(accounts));
};

export const loadTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  const saved = localStorage.getItem('wallet_transactions_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse transactions", e);
    }
  }
  localStorage.setItem('wallet_transactions_list', JSON.stringify(INITIAL_TRANSACTIONS));
  return INITIAL_TRANSACTIONS;
};

export const saveTransactions = (txns: Transaction[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wallet_transactions_list', JSON.stringify(txns));
};
