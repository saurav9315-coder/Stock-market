/**
 * Antigravity Quant - Enterprise Admin Mock Database
 * 
 * Provides centralized in-memory and local-storage data collections 
 * to drive the executive admin dashboard.
 */

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  accountType: 'Retail Trader' | 'Pro Investor' | 'Institutional Account';
  status: 'Live' | 'Demo';
  walletBalance: number;
  kycStatus: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  accountStatus: 'Active' | 'Suspended';
  lastLogin: string;
}

export interface KycSubmission {
  userId: string;
  name: string;
  email: string;
  documentType: 'Passport' | 'National ID' | 'Driver License';
  documentNumber: string;
  submittedAt: string;
  frontPageUrl: string;
  backPageUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  utrNumber: string;
  screenshotUrl: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  name: string;
  amount: number;
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifscOrSwift: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  receiptUrl?: string;
  notes?: string;
}

export interface ExchangeConfig {
  code: string;
  name: string;
  status: 'Open' | 'Closed' | 'Halted';
  tradingHours: string;
  timeZone: string;
  holidays: string[];
}

export interface AdminStock {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  category: 'Featured' | 'Trending' | 'None';
  sector: string;
}

export interface AdminNews {
  id: string;
  title: string;
  category: string;
  status: 'Published' | 'Draft';
  publishedAt: string;
  summary: string;
  featured: boolean;
}

export interface AiMetric {
  apiHealth: string; // e.g. "99.8% Uptime"
  creditsUsed: number;
  creditsRemaining: number;
  averageResponseTimeMs: number;
  successRatePercent: number;
}

export interface AiPromptLog {
  id: string;
  userId: string;
  prompt: string;
  tokensUsed: number;
  costUSD: number;
  timestamp: string;
}

export interface PaymentConfiguration {
  bankName: string;
  holderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  qrCodeUrl: string;
  minDeposit: number;
  maxDeposit: number;
  withdrawalFeePercent: number;
}

export interface AdminSupportMessage {
  sender: 'User' | 'Admin';
  senderName: string;
  text: string;
  time: string;
}

export interface AdminSupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: 'General' | 'API Access' | 'KYC Verification' | 'Trading Issues' | 'Deposits/Withdrawals';
  status: 'Open' | 'Resolved';
  createdAt: string;
  description: string;
  messages: AdminSupportMessage[];
}

export interface SecurityEvent {
  id: string;
  event: string;
  userEmail: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: 'Failed' | 'Locked' | 'Suspicious' | 'Verified';
}

export interface AuditLogEntry {
  id: string;
  adminName: string;
  adminRole: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export interface AdminRoleConfig {
  role: string;
  permissions: {
    dashboard: boolean;
    users: boolean;
    kyc: boolean;
    transactions: boolean;
    markets: boolean;
    stocks: boolean;
    news: boolean;
    ai: boolean;
    payments: boolean;
    support: boolean;
    audit: boolean;
    security: boolean;
    settings: boolean;
  };
}

export interface SystemSettingsConfig {
  platformName: string;
  logoText: string;
  defaultTheme: 'light' | 'dark' | 'system';
  supportedLanguages: string[];
  baseCurrency: string;
  exchangeRateUSD: number;
  emailTemplateWelcome: string;
  emailTemplateKycApproved: string;
  emailTemplateDepositSuccess: string;
  smsTemplateAlert: string;
}

// Gorgeous SVG previews representing ID credentials (documents)
const passportSvg = (name: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200" style="background:%23111827;border-radius:12px;border:2px solid %231f2937;padding:16px;"><rect width="100%" height="100%" fill="%23111827"/><text x="20" y="40" fill="%236366f1" font-family="sans-serif" font-size="16" font-weight="bold">PASSPORT DEPT</text><rect x="20" y="60" width="70" height="90" fill="%231f2937" rx="6"/><circle cx="55" cy="95" r="18" fill="%234b5563"/><path d="M35 135 C 35 120, 75 120, 75 135 Z" fill="%234b5563"/><text x="110" y="80" fill="%23e5e7eb" font-family="sans-serif" font-size="14" font-weight="bold">${name.toUpperCase()}</text><text x="110" y="100" fill="%239ca3af" font-family="sans-serif" font-size="11">DOB: 1994-06-15</text><text x="110" y="120" fill="%239ca3af" font-family="sans-serif" font-size="11">No: USA88204910</text><text x="110" y="140" fill="%2310b981" font-family="sans-serif" font-size="12" font-weight="bold">OFFICIAL DOCUMENT</text></svg>`;

const idCardSvg = (name: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" width="300" height="200" style="background:%230f172a;border-radius:12px;border:2px solid %23334155;padding:16px;"><rect width="100%" height="100%" fill="%230f172a"/><text x="20" y="40" fill="%230ea5e9" font-family="sans-serif" font-size="16" font-weight="bold">NATIONAL ID CARD</text><rect x="210" y="20" width="70" height="85" fill="%231e293b" rx="4"/><circle cx="245" cy="50" r="15" fill="%23475569"/><path d="M225 85 C 225 72, 265 72, 265 85 Z" fill="%23475569"/><text x="20" y="85" fill="%23f8fafc" font-family="sans-serif" font-size="14" font-weight="bold">${name}</text><text x="20" y="105" fill="%2394a3b8" font-family="sans-serif" font-size="11">ID: REG-098817290</text><text x="20" y="125" fill="%2394a3b8" font-family="sans-serif" font-size="11">Country: DE / Germany</text><text x="20" y="150" fill="%230ea5e9" font-family="sans-serif" font-size="12" font-weight="bold">VERIFIED IDENTITY</text></svg>`;

const screenshotSvg = (amount: number, utr: string) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 350" width="300" height="350" style="background:%230b0f19;border-radius:16px;border:1px solid %231f2937;padding:24px;"><rect width="100%" height="100%" fill="%230b0f19"/><circle cx="150" cy="70" r="30" fill="%2310b981" fill-opacity="0.15"/><path d="M140 70 L147 77 L162 62" fill="none" stroke="%2310b981" stroke-width="4" stroke-linecap="round"/><text x="150" y="130" text-anchor="middle" fill="%23f9fafb" font-family="sans-serif" font-size="20" font-weight="bold">Transaction Success</text><text x="150" y="165" text-anchor="middle" fill="%2310b981" font-family="sans-serif" font-size="28" font-weight="bold">$${amount.toLocaleString()}</text><line x1="20" y1="190" x2="280" y2="190" stroke="%231f2937" stroke-width="1"/><text x="20" y="220" fill="%239ca3af" font-family="sans-serif" font-size="12">REF / UTR</text><text x="20" y="240" fill="%23f9fafb" font-family="sans-serif" font-size="13" font-weight="bold">${utr}</text><text x="20" y="270" fill="%239ca3af" font-family="sans-serif" font-size="12">TO</text><text x="20" y="290" fill="%23f9fafb" font-family="sans-serif" font-size="13" font-weight="bold">Antigravity Clearing Bank</text></svg>`;

// ==========================================
// INITIAL DATA
// ==========================================

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    userId: 'USR-8820491',
    name: 'Alex Mercer',
    email: 'alex.mercer@antigravity-quant.com',
    phone: '+1 (555) 234-8829',
    country: 'United States',
    accountType: 'Pro Investor',
    status: 'Live',
    walletBalance: 72500.50,
    kycStatus: 'Approved',
    accountStatus: 'Active',
    lastLogin: '2026-07-16T15:45:00Z',
  },
  {
    userId: 'USR-8820492',
    name: 'Sarah Jenkins',
    email: 'sarah.j@netcorp.co.uk',
    phone: '+44 7911 123456',
    country: 'United Kingdom',
    accountType: 'Retail Trader',
    status: 'Live',
    walletBalance: 1240.20,
    kycStatus: 'Pending',
    accountStatus: 'Active',
    lastLogin: '2026-07-16T14:30:00Z',
  },
  {
    userId: 'USR-8820493',
    name: 'Yuki Tanaka',
    email: 'tanaka.yuki@quant-jp.tokyo',
    phone: '+81 90 1234 5678',
    country: 'Japan',
    accountType: 'Retail Trader',
    status: 'Demo',
    walletBalance: 95000.00,
    kycStatus: 'Under Review',
    accountStatus: 'Active',
    lastLogin: '2026-07-16T12:00:00Z',
  },
  {
    userId: 'USR-8820494',
    name: 'Michael Chang',
    email: 'm.chang@singapore-ventures.sg',
    phone: '+65 9123 4567',
    country: 'Singapore',
    accountType: 'Institutional Account',
    status: 'Live',
    walletBalance: 1548000.00,
    kycStatus: 'Approved',
    accountStatus: 'Active',
    lastLogin: '2026-07-16T15:58:00Z',
  },
  {
    userId: 'USR-8820495',
    name: 'Elena Rostova',
    email: 'elena.rost@berlin-tech.de',
    phone: '+49 170 1234567',
    country: 'Germany',
    accountType: 'Pro Investor',
    status: 'Live',
    walletBalance: 43250.00,
    kycStatus: 'Rejected',
    accountStatus: 'Suspended',
    lastLogin: '2026-07-11T09:12:00Z',
  },
  {
    userId: 'USR-8820496',
    name: 'Carlos Santana',
    email: 'c.santana@samba-capital.com.br',
    phone: '+55 11 91234 5678',
    country: 'Brazil',
    accountType: 'Retail Trader',
    status: 'Demo',
    walletBalance: 1500.00,
    kycStatus: 'Pending',
    accountStatus: 'Active',
    lastLogin: '2026-07-16T04:20:00Z',
  },
  {
    userId: 'USR-8820497',
    name: 'Amara Okafor',
    email: 'amara.okafor@lagos-capital.ng',
    phone: '+234 803 123 4567',
    country: 'Nigeria',
    accountType: 'Retail Trader',
    status: 'Live',
    walletBalance: 450.00,
    kycStatus: 'Approved',
    accountStatus: 'Active',
    lastLogin: '2026-07-16T13:45:00Z',
  },
  {
    userId: 'USR-8820498',
    name: 'David Miller',
    email: 'david.miller@vancouver-quant.ca',
    phone: '+1 (604) 555-0192',
    country: 'Canada',
    accountType: 'Pro Investor',
    status: 'Live',
    walletBalance: 28900.00,
    kycStatus: 'Pending',
    accountStatus: 'Active',
    lastLogin: '2026-07-12T16:22:00Z',
  },
  {
    userId: 'USR-8820499',
    name: 'Fatima Al-Sayed',
    email: 'fatima.as@dubai-wealth.ae',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    accountType: 'Institutional Account',
    status: 'Live',
    walletBalance: 5200000.00,
    kycStatus: 'Approved',
    accountStatus: 'Active',
    lastLogin: '2026-07-15T18:10:00Z',
  },
  {
    userId: 'USR-8820500',
    name: 'Liam O\'Connor',
    email: 'l.oconnor@dublin-capital.ie',
    phone: '+353 85 123 4567',
    country: 'Ireland',
    accountType: 'Retail Trader',
    status: 'Live',
    walletBalance: 0.00,
    kycStatus: 'Pending',
    accountStatus: 'Suspended',
    lastLogin: '2026-07-10T11:55:00Z',
  }
];

export const INITIAL_KYC_SUBMISSIONS: KycSubmission[] = [
  {
    userId: 'USR-8820492',
    name: 'Sarah Jenkins',
    email: 'sarah.j@netcorp.co.uk',
    documentType: 'Passport',
    documentNumber: 'UKP992019A',
    submittedAt: '2026-07-16T10:15:00Z',
    frontPageUrl: passportSvg('Sarah Jenkins'),
    backPageUrl: passportSvg('Sarah Jenkins Page 2'),
    status: 'Pending',
  },
  {
    userId: 'USR-8820493',
    name: 'Yuki Tanaka',
    email: 'tanaka.yuki@quant-jp.tokyo',
    documentType: 'National ID',
    documentNumber: 'JPN8810290',
    submittedAt: '2026-07-15T09:30:00Z',
    frontPageUrl: idCardSvg('Yuki Tanaka'),
    backPageUrl: idCardSvg('Yuki Tanaka (Back)'),
    status: 'Pending',
  },
  {
    userId: 'USR-8820495',
    name: 'Elena Rostova',
    email: 'elena.rost@berlin-tech.de',
    documentType: 'National ID',
    documentNumber: 'DEU2291030',
    submittedAt: '2026-07-10T11:00:00Z',
    frontPageUrl: idCardSvg('Elena Rostova'),
    backPageUrl: idCardSvg('Elena Rostova (Back)'),
    status: 'Rejected',
    notes: 'Document expired in March 2026. Requesting renewal.',
  },
  {
    userId: 'USR-8820496',
    name: 'Carlos Santana',
    email: 'c.santana@samba-capital.com.br',
    documentType: 'Driver License',
    documentNumber: 'BR559029103',
    submittedAt: '2026-07-16T02:00:00Z',
    frontPageUrl: idCardSvg('Carlos Santana'),
    backPageUrl: idCardSvg('Carlos Santana (Back)'),
    status: 'Pending',
  },
  {
    userId: 'USR-8820498',
    name: 'David Miller',
    email: 'david.miller@vancouver-quant.ca',
    documentType: 'Passport',
    documentNumber: 'CAN88204918',
    submittedAt: '2026-07-12T14:00:00Z',
    frontPageUrl: passportSvg('David Miller'),
    backPageUrl: passportSvg('David Miller Page 2'),
    status: 'Pending',
  }
];

export const INITIAL_DEPOSIT_REQUESTS: DepositRequest[] = [
  {
    id: 'DEP-100231',
    userId: 'USR-8820492',
    name: 'Sarah Jenkins',
    email: 'sarah.j@netcorp.co.uk',
    amount: 1200.00,
    currency: 'USD',
    paymentMethod: 'Bank Wire',
    utrNumber: 'UTR882910482910',
    screenshotUrl: screenshotSvg(1200.00, 'UTR882910482910'),
    submittedAt: '2026-07-16T12:30:00Z',
    status: 'Pending',
  },
  {
    id: 'DEP-100232',
    userId: 'USR-8820498',
    name: 'David Miller',
    email: 'david.miller@vancouver-quant.ca',
    amount: 5000.00,
    currency: 'USD',
    paymentMethod: 'UPI Instant',
    utrNumber: 'UTR009988277192',
    screenshotUrl: screenshotSvg(5000.00, 'UTR009988277192'),
    submittedAt: '2026-07-15T15:20:00Z',
    status: 'Pending',
  },
  {
    id: 'DEP-100233',
    userId: 'USR-8820497',
    name: 'Amara Okafor',
    email: 'amara.okafor@lagos-capital.ng',
    amount: 450.00,
    currency: 'USD',
    paymentMethod: 'Bank Wire',
    utrNumber: 'UTR772910482933',
    screenshotUrl: screenshotSvg(450.00, 'UTR772910482933'),
    submittedAt: '2026-07-16T10:10:00Z',
    status: 'Pending',
  }
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'WTH-992019',
    userId: 'USR-8820491',
    name: 'Alex Mercer',
    amount: 1500.00,
    bankName: 'Chase Bank',
    holderName: 'Alex Mercer',
    accountNumber: '******3394',
    ifscOrSwift: 'CHASUS33XXX',
    submittedAt: '2026-07-16T14:40:00Z',
    status: 'Pending',
  },
  {
    id: 'WTH-992020',
    userId: 'USR-8820499',
    name: 'Fatima Al-Sayed',
    amount: 50000.00,
    bankName: 'Emirates NBD',
    holderName: 'Fatima Al-Sayed',
    accountNumber: '******9988',
    ifscOrSwift: 'EBILAE2DXXX',
    submittedAt: '2026-07-16T11:00:00Z',
    status: 'Pending',
  },
  {
    id: 'WTH-992021',
    userId: 'USR-8820495',
    name: 'Elena Rostova',
    amount: 800.00,
    bankName: 'Deutsche Bank',
    holderName: 'Elena Rostova',
    accountNumber: '******7721',
    ifscOrSwift: 'DEUTDEDDXXX',
    submittedAt: '2026-07-10T12:00:00Z',
    status: 'Pending',
  }
];

export const INITIAL_EXCHANGES: ExchangeConfig[] = [
  {
    code: 'NSE',
    name: 'National Stock Exchange (India)',
    status: 'Open',
    tradingHours: '09:15 - 15:30 IST',
    timeZone: 'Asia/Kolkata',
    holidays: ['2026-08-15 (Independence Day)', '2026-10-02 (Gandhi Jayanti)'],
  },
  {
    code: 'NYSE',
    name: 'New York Stock Exchange (USA)',
    status: 'Open',
    tradingHours: '09:30 - 16:00 EST',
    timeZone: 'America/New_York',
    holidays: ['2026-09-07 (Labor Day)', '2026-11-26 (Thanksgiving Day)'],
  },
  {
    code: 'NASDAQ',
    name: 'NASDAQ Global Market (USA)',
    status: 'Open',
    tradingHours: '09:30 - 16:00 EST',
    timeZone: 'America/New_York',
    holidays: ['2026-09-07 (Labor Day)', '2026-11-26 (Thanksgiving Day)'],
  },
  {
    code: 'CRYPTO',
    name: 'Antigravity Digital Clearing Matrix',
    status: 'Open',
    tradingHours: '24/7/365 Continuous',
    timeZone: 'UTC',
    holidays: [],
  }
];

export const INITIAL_ADMIN_STOCKS: AdminStock[] = [
  { id: 'stk-1', symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', price: 175.40, change: 1.45, category: 'Featured', sector: 'Technology' },
  { id: 'stk-2', symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', price: 390.10, change: 0.85, category: 'Trending', sector: 'Technology' },
  { id: 'stk-3', symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', price: 195.20, change: -2.30, category: 'Trending', sector: 'Automotive' },
  { id: 'stk-4', symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', price: 650.80, change: 4.25, category: 'Featured', sector: 'Technology' },
  { id: 'stk-5', symbol: 'BTC-USD', name: 'Bitcoin / USD', exchange: 'CRYPTO', price: 58240.00, change: -1.75, category: 'Featured', sector: 'Digital Assets' },
  { id: 'stk-6', symbol: 'ETH-USD', name: 'Ethereum / USD', exchange: 'CRYPTO', price: 3120.50, change: 0.90, category: 'Trending', sector: 'Digital Assets' },
  { id: 'stk-7', symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', price: 178.15, change: 1.10, category: 'None', sector: 'Consumer Cyclical' },
  { id: 'stk-8', symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', price: 585.30, change: -0.40, category: 'None', sector: 'Communication Services' }
];

export const INITIAL_ADMIN_NEWS: AdminNews[] = [
  {
    id: 'nws-1',
    title: 'Fed Signals Potential Rate Cuts by Q3 Amid Cooling Inflation Indicators',
    category: 'Macroeconomics',
    status: 'Published',
    publishedAt: '2026-07-16T10:00:00Z',
    summary: 'The Federal Reserve Chairman implied upcoming policy rotations during the New York Economic Club session.',
    featured: true,
  },
  {
    id: 'nws-2',
    title: 'NVIDIA Launches Quantum Simulation Kernels for Institutional Clearances',
    category: 'Technology',
    status: 'Published',
    publishedAt: '2026-07-15T16:45:00Z',
    summary: 'New enterprise SDK promises 100x acceleration on stochastic pricing calculations.',
    featured: true,
  },
  {
    id: 'nws-3',
    title: 'Digital Token Liquidations Trigger Heavy Momentum Offloading at Support Nodes',
    category: 'Crypto',
    status: 'Draft',
    publishedAt: '2026-07-16T13:00:00Z',
    summary: 'Brief analysis on BTC offloading channels and key support buffers near $56k.',
    featured: false,
  }
];

export const INITIAL_AI_METRIC: AiMetric = {
  apiHealth: '99.95% Optimal',
  creditsUsed: 14890,
  creditsRemaining: 85110,
  averageResponseTimeMs: 142,
  successRatePercent: 99.98,
};

export const INITIAL_AI_PROMPTS: AiPromptLog[] = [
  {
    id: 'PRM-00210',
    userId: 'USR-8820491',
    prompt: 'Synthesize standard deviation matrices for AAPL, TSLA, and MSFT under a 30-day volatility overlay.',
    tokensUsed: 1420,
    costUSD: 0.0284,
    timestamp: '2026-07-16T15:30:00Z',
  },
  {
    id: 'PRM-00211',
    userId: 'USR-8820494',
    prompt: 'Assess stochastic risk metrics for portfolios with 70% tech equities and 30% crypto positions.',
    tokensUsed: 2100,
    costUSD: 0.0420,
    timestamp: '2026-07-16T14:15:00Z',
  },
  {
    id: 'PRM-00212',
    userId: 'USR-8820499',
    prompt: 'Summarize key earnings indicators for NVDA and forecast institutional order flows.',
    tokensUsed: 980,
    costUSD: 0.0196,
    timestamp: '2026-07-16T11:45:00Z',
  }
];

export const INITIAL_PAYMENT_CONFIG: PaymentConfiguration = {
  bankName: 'Antigravity Clearing Corp Bank',
  holderName: 'Antigravity Trading Sandbox LLP',
  accountNumber: '99881122003344',
  ifscCode: 'ANTIGRAV00099',
  upiId: 'antigravity@ybl',
  qrCodeUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200" style="background:%230b0f19;padding:12px;border-radius:12px;border:1px solid %231f2937;"><rect width="100%" height="100%" fill="%230b0f19"/><rect x="10" y="10" width="24" height="24" fill="%236366f1" rx="3"/><rect x="14" y="14" width="16" height="16" fill="%230b0f19"/><rect x="17" y="17" width="10" height="10" fill="%236366f1" rx="1.5"/><rect x="66" y="10" width="24" height="24" fill="%236366f1" rx="3"/><rect x="70" y="14" width="16" height="16" fill="%230b0f19"/><rect x="73" y="17" width="10" height="10" fill="%236366f1" rx="1.5"/><rect x="10" y="66" width="24" height="24" fill="%236366f1" rx="3"/><rect x="14" y="70" width="16" height="16" fill="%230b0f19"/><rect x="17" y="73" width="10" height="10" fill="%236366f1" rx="1.5"/><circle cx="50" cy="50" r="4" fill="%2310b981"/></svg>`,
  minDeposit: 100.00,
  maxDeposit: 100000.00,
  withdrawalFeePercent: 0.15, // 0.15% fee
};

export const INITIAL_TICKETS_EXT: AdminSupportTicket[] = [
  {
    id: 'TCK-882910',
    userId: 'USR-8820491',
    userName: 'Alex Mercer',
    subject: 'Latency issues on Stochastic websocket socket channel feed',
    category: 'Trading Issues',
    status: 'Open',
    createdAt: '2026-07-14T11:00:00Z',
    description: 'I am experiencing delays of up to 450ms on real-time price updates for high-volatility tick feeds.',
    messages: [
      { sender: 'User', senderName: 'Alex Mercer', text: 'I am experiencing delays of up to 450ms on real-time price updates for high-volatility tick feeds.', time: '2026-07-14T11:00:00Z' },
      { sender: 'Admin', senderName: 'Support Desk 3', text: 'Hi Alex, thank you for writing. Our engineering desk is currently scaling up our sockets allocation nodes in New York. We will resolve this within 24 hours.', time: '2026-07-14T12:30:00Z' },
      { sender: 'User', senderName: 'Alex Mercer', text: 'Perfect, please keep me updated once node redistribution is complete.', time: '2026-07-14T14:00:00Z' }
    ]
  },
  {
    id: 'TCK-882911',
    userId: 'USR-8820492',
    userName: 'Sarah Jenkins',
    subject: 'Passport rejection query',
    category: 'KYC Verification',
    status: 'Open',
    createdAt: '2026-07-16T11:30:00Z',
    description: 'I uploaded my passport but it says status is pending. Can we speed it up?',
    messages: [
      { sender: 'User', senderName: 'Sarah Jenkins', text: 'I uploaded my passport but it says status is pending. Can we speed it up?', time: '2026-07-16T11:30:00Z' }
    ]
  },
  {
    id: 'TCK-881903',
    userId: 'USR-8820491',
    userName: 'Alex Mercer',
    subject: 'API Access Trade Permissions clearance check',
    category: 'API Access',
    status: 'Resolved',
    createdAt: '2026-06-20T09:15:00Z',
    description: 'Requesting trade permission credentials for institutional compliance audits.',
    messages: [
      { sender: 'User', senderName: 'Alex Mercer', text: 'Requesting trade permission credentials for institutional compliance audits.', time: '2026-06-20T09:15:00Z' },
      { sender: 'Admin', senderName: 'Compliance Desk', text: 'Your API profile has been approved for full execution capabilities. The token secret key has been refreshed.', time: '2026-06-20T14:45:00Z' }
    ]
  }
];

export const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  { id: 'SEC-001', event: 'Suspicious IP Blocked', userEmail: 'l.oconnor@dublin-capital.ie', timestamp: '2026-07-16T15:20:00Z', ipAddress: '185.220.101.42', device: 'Linux Workstation', status: 'Suspicious' },
  { id: 'SEC-002', event: 'Failed Password Lockout', userEmail: 'elena.rost@berlin-tech.de', timestamp: '2026-07-16T11:10:00Z', ipAddress: '198.51.100.22', device: 'Firefox Windows', status: 'Locked' },
  { id: 'SEC-003', event: 'Multi-Factor Re-authentication', userEmail: 'm.chang@singapore-ventures.sg', timestamp: '2026-07-16T15:58:00Z', ipAddress: '172.56.21.89', device: 'Safari Mobile', status: 'Verified' },
  { id: 'SEC-004', event: 'Failed API Signature Call', userEmail: 'unknown-client', timestamp: '2026-07-16T08:12:00Z', ipAddress: '45.12.90.111', device: 'NodeJS Script', status: 'Failed' }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'ADT-001', adminName: 'Chief Operator', adminRole: 'Super Admin', action: 'Approved KYC document for Alex Mercer (USR-8820491)', timestamp: '2026-07-16T08:30:00Z', ipAddress: '127.0.0.1', device: 'Chrome Admin Panel' },
  { id: 'ADT-002', adminName: 'Operator 1', adminRole: 'Support', action: 'Replied to Ticket TCK-882910', timestamp: '2026-07-14T12:30:00Z', ipAddress: '192.168.1.5', device: 'Firefox Admin Panel' }
];

export const DEFAULT_ADMIN_ROLES: AdminRoleConfig[] = [
  {
    role: 'Super Admin',
    permissions: {
      dashboard: true, users: true, kyc: true, transactions: true, markets: true, stocks: true, news: true, ai: true, payments: true, support: true, audit: true, security: true, settings: true
    }
  },
  {
    role: 'Admin',
    permissions: {
      dashboard: true, users: true, kyc: true, transactions: true, markets: true, stocks: true, news: true, ai: true, payments: false, support: true, audit: true, security: true, settings: false
    }
  },
  {
    role: 'Moderator',
    permissions: {
      dashboard: true, users: true, kyc: true, transactions: false, markets: false, stocks: false, news: true, ai: false, payments: false, support: true, audit: false, security: false, settings: false
    }
  },
  {
    role: 'Support',
    permissions: {
      dashboard: true, users: true, kyc: true, transactions: false, markets: false, stocks: false, news: false, ai: false, payments: false, support: true, audit: false, security: false, settings: false
    }
  },
  {
    role: 'Finance Manager',
    permissions: {
      dashboard: true, users: false, kyc: false, transactions: true, markets: false, stocks: false, news: false, ai: false, payments: true, support: false, audit: true, security: false, settings: false
    }
  },
  {
    role: 'Content Manager',
    permissions: {
      dashboard: true, users: false, kyc: false, transactions: false, markets: true, stocks: true, news: true, ai: false, payments: false, support: false, audit: false, security: false, settings: false
    }
  }
];

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsConfig = {
  platformName: 'StockInside Trading',
  logoText: 'STOCKINSIDE TRADING',
  defaultTheme: 'dark',
  supportedLanguages: ['English (US)', 'Japanese', 'German', 'Portuguese', 'Hindi'],
  baseCurrency: 'USD ($)',
  exchangeRateUSD: 1.0,
  emailTemplateWelcome: 'Welcome to StockInside Trading. Your quantitative trading cockpit is ready.',
  emailTemplateKycApproved: 'Congratulations. Your institutional KYC verification has been cleared.',
  emailTemplateDepositSuccess: 'Transaction credit completed. Your sandbox wallet has been funded.',
  smsTemplateAlert: 'StockInside Security Alert: New login detected from unknown node.',
};

// ==========================================
// STORE LOADER & SAVER WRAPPER
// ==========================================

export class AdminDatabase {
  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const value = localStorage.getItem(`admin_db_${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    localStorage.setItem(`admin_db_${key}`, JSON.stringify(defaultValue));
    return defaultValue;
  }

  static set<T>(key: string, value: T) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`admin_db_${key}`, JSON.stringify(value));
    }
  }

  // Active simulated role
  static getSimulatedRole(): string {
    return this.get<string>('simulated_role', 'Super Admin');
  }

  static setSimulatedRole(role: string) {
    this.set<string>('simulated_role', role);
  }

  // Active Users list
  static getUsers(): AdminUser[] {
    return this.get<AdminUser[]>('users', INITIAL_ADMIN_USERS);
  }

  static setUsers(users: AdminUser[]) {
    this.set<AdminUser[]>('users', users);
  }

  // KYC Submissions
  static getKycSubmissions(): KycSubmission[] {
    return this.get<KycSubmission[]>('kyc_submissions', INITIAL_KYC_SUBMISSIONS);
  }

  static setKycSubmissions(kyc: KycSubmission[]) {
    this.set<KycSubmission[]>('kyc_submissions', kyc);
  }

  // Deposits
  static getDeposits(): DepositRequest[] {
    return this.get<DepositRequest[]>('deposits', INITIAL_DEPOSIT_REQUESTS);
  }

  static setDeposits(deps: DepositRequest[]) {
    this.set<DepositRequest[]>('deposits', deps);
  }

  // Withdrawals
  static getWithdrawals(): WithdrawalRequest[] {
    return this.get<WithdrawalRequest[]>('withdrawals', INITIAL_WITHDRAWAL_REQUESTS);
  }

  static setWithdrawals(withs: WithdrawalRequest[]) {
    this.set<WithdrawalRequest[]>('withdrawals', withs);
  }

  // Exchanges
  static getExchanges(): ExchangeConfig[] {
    return this.get<ExchangeConfig[]>('exchanges', INITIAL_EXCHANGES);
  }

  static setExchanges(exchanges: ExchangeConfig[]) {
    this.set<ExchangeConfig[]>('exchanges', exchanges);
  }

  // Stocks
  static getStocks(): AdminStock[] {
    return this.get<AdminStock[]>('stocks', INITIAL_ADMIN_STOCKS);
  }

  static setStocks(stocks: AdminStock[]) {
    this.set<AdminStock[]>('stocks', stocks);
  }

  // News
  static getNews(): AdminNews[] {
    return this.get<AdminNews[]>('news', INITIAL_ADMIN_NEWS);
  }

  static setNews(news: AdminNews[]) {
    this.set<AdminNews[]>('news', news);
  }

  // AI Metric
  static getAiMetric(): AiMetric {
    return this.get<AiMetric>('ai_metric', INITIAL_AI_METRIC);
  }

  static setAiMetric(metric: AiMetric) {
    this.set<AiMetric>('ai_metric', metric);
  }

  // AI Prompts
  static getAiPrompts(): AiPromptLog[] {
    return this.get<AiPromptLog[]>('ai_prompts', INITIAL_AI_PROMPTS);
  }

  static setAiPrompts(prompts: AiPromptLog[]) {
    this.set<AiPromptLog[]>('ai_prompts', prompts);
  }

  // Payment Configuration
  static getPaymentConfig(): PaymentConfiguration {
    return this.get<PaymentConfiguration>('payment_config', INITIAL_PAYMENT_CONFIG);
  }

  static setPaymentConfig(config: PaymentConfiguration) {
    this.set<PaymentConfiguration>('payment_config', config);
  }

  // Support tickets
  static getTickets(): AdminSupportTicket[] {
    return this.get<AdminSupportTicket[]>('support_tickets_ext', INITIAL_TICKETS_EXT);
  }

  static setTickets(tickets: AdminSupportTicket[]) {
    this.set<AdminSupportTicket[]>('support_tickets_ext', tickets);
  }

  // Security events
  static getSecurityEvents(): SecurityEvent[] {
    return this.get<SecurityEvent[]>('security_events', INITIAL_SECURITY_EVENTS);
  }

  static setSecurityEvents(events: SecurityEvent[]) {
    this.set<SecurityEvent[]>('security_events', events);
  }

  // Audit Logs
  static getAuditLogs(): AuditLogEntry[] {
    return this.get<AuditLogEntry[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  static setAuditLogs(logs: AuditLogEntry[]) {
    this.set<AuditLogEntry[]>('audit_logs', logs);
  }

  // Roles permissions
  static getRoleConfigs(): AdminRoleConfig[] {
    return this.get<AdminRoleConfig[]>('role_configs', DEFAULT_ADMIN_ROLES);
  }

  static setRoleConfigs(roles: AdminRoleConfig[]) {
    this.set<AdminRoleConfig[]>('role_configs', roles);
  }

  // System Settings
  static getSystemSettings(): SystemSettingsConfig {
    return this.get<SystemSettingsConfig>('system_settings', DEFAULT_SYSTEM_SETTINGS);
  }

  static setSystemSettings(settings: SystemSettingsConfig) {
    this.set<SystemSettingsConfig>('system_settings', settings);
  }

  // Helper: Log Admin Action
  static logAction(adminName: string, adminRole: string, action: string) {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `ADT-${Math.floor(100 + Math.random() * 900)}`,
      adminName,
      adminRole,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      device: 'Chrome Admin Web Console',
    };
    this.setAuditLogs([newEntry, ...logs]);
  }
}
