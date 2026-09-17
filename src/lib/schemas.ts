import { z } from 'zod';

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

export const LoginSchema = z.object({
  email: z.string().email('Provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters with high entropy'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Provide a valid email address'),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must match'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const VerifyOtpSchema = z.object({
  code: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

export const Verify2faSchema = z.object({
  code: z.string().length(6, 'MFA code must be exactly 6 digits'),
});

// ==========================================
// STOCK SCHEMAS
// ==========================================

export const RecommendationsSchema = z.object({
  buy: z.number(),
  hold: z.number(),
  sell: z.number(),
});

export const StockQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  prevClose: z.number(),
  volume: z.number(),
  marketCap: z.number(),
  peRatio: z.number(),
  eps: z.number(),
  dividendYield: z.number(),
  beta: z.number(),
  fiftyTwoWeekRange: z.object({ low: z.number(), high: z.number() }),
  recommendations: RecommendationsSchema,
  targetPrice: z.number(),
  roe: z.number(),
  sharesOutstanding: z.string(),
  avgVolume: z.string(),
  industry: z.string(),
  sector: z.string(),
  grossMargin: z.number(),
  operatingMargin: z.number(),
  freeCashFlow: z.string(),
  cashFlow: z.string(),
  totalAssets: z.string(),
  totalLiabilities: z.string(),
});

export const ChartPointSchema = z.object({
  time: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  rsi: z.number().optional(),
  macd: z.number().optional(),
  macdSignal: z.number().optional(),
  macdHist: z.number().optional(),
});

// ==========================================
// WATCHLIST SCHEMAS
// ==========================================

export const WatchlistSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Watchlist name is mandatory'),
  color: z.string(),
  symbols: z.array(z.string()),
});

export const CreateWatchlistSchema = z.object({
  name: z.string().min(1, 'Watchlist name is mandatory'),
  color: z.string().default('bg-blue-500'),
});

// ==========================================
// PORTFOLIO & WALLET SCHEMAS
// ==========================================

export const PortfolioSummarySchema = z.object({
  totalValue: z.number(),
  cashBalance: z.number(),
  investedValue: z.number(),
  totalGain: z.number(),
  totalGainPercent: z.number(),
});

export const HoldingSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  shares: z.number(),
  avgBuyPrice: z.number(),
  currentPrice: z.number(),
  marketValue: z.number(),
  gainLoss: z.number(),
  gainLossPercent: z.number(),
  allocation: z.number(),
});

export const WalletTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['Deposit', 'Withdrawal']),
  amount: z.number(),
  status: z.enum(['Pending', 'Completed', 'Rejected']),
  date: z.string(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

export const DepositRequestSchema = z.object({
  amount: z.number().positive('Deposit amount must be greater than zero'),
  method: z.string().min(1, 'Payment method required'),
  referenceId: z.string().optional(),
  proofUrl: z.string().optional(),
});

export const WithdrawalRequestSchema = z.object({
  amount: z.number().positive('Withdrawal amount must be greater than zero'),
  method: z.string().min(1, 'Destination route is required'),
  bankDetails: z.string().min(1, 'Bank or address details are mandatory'),
});

// ==========================================
// AI & ALERT SCHEMAS
// ==========================================

export const AiChatRequestSchema = z.object({
  message: z.string().min(1, 'Message payload empty'),
});

export const AlertTriggerSchema = z.object({
  symbol: z.string(),
  type: z.enum(['GREATER_THAN', 'LESS_THAN', 'PERCENT_CHANGE']),
  targetValue: z.number(),
  isActive: z.boolean().default(true),
});
