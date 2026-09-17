import { api } from '@/lib/api';
import * as schemas from '@/lib/schemas';
import { z } from 'zod';

// ==========================================
// AUTH SERVICES
// ==========================================
export const AuthService = {
  login: async (payload: z.infer<typeof schemas.LoginSchema>) => {
    schemas.LoginSchema.parse(payload);
    return api.post('/auth/login', payload);
  },
  register: async (payload: z.infer<typeof schemas.RegisterSchema>) => {
    schemas.RegisterSchema.parse(payload);
    return api.post('/auth/register', payload);
  },
  forgotPassword: async (payload: z.infer<typeof schemas.ForgotPasswordSchema>) => {
    schemas.ForgotPasswordSchema.parse(payload);
    return api.post('/auth/forgot-password', payload);
  },
  resetPassword: async (payload: z.infer<typeof schemas.ResetPasswordSchema>) => {
    schemas.ResetPasswordSchema.parse(payload);
    return api.post('/auth/reset-password', payload);
  },
  verifyOtp: async (payload: z.infer<typeof schemas.VerifyOtpSchema>) => {
    schemas.VerifyOtpSchema.parse(payload);
    return api.post('/auth/verify-otp', payload);
  },
  verifyEmail: async (code: string) => {
    return api.post('/auth/verify-email', { code });
  },
  verify2fa: async (code: string) => {
    return api.post('/auth/verify-2fa', { code });
  },
  logout: async () => {
    return api.post('/auth/logout');
  },
};

// ==========================================
// USER SERVICES
// ==========================================
export const UserService = {
  getProfile: async () => {
    return api.get('/users/profile');
  },
  updateProfile: async (data: any) => {
    return api.put('/users/profile', data);
  },
};

// ==========================================
// STOCK & MARKET SERVICES
// ==========================================
export const StockService = {
  list: async () => {
    const res = await api.get('/stocks');
    return z.array(schemas.StockQuoteSchema).parse(res);
  },
  detail: async (symbol: string) => {
    const res = await api.get(`/stocks/${symbol}`);
    return schemas.StockQuoteSchema.parse(res);
  },
  historical: async (symbol: string, timeRange: string) => {
    const res = await api.get(`/stocks/${symbol}/historical`, { params: { range: timeRange } });
    return z.array(schemas.ChartPointSchema).parse(res);
  },
  search: async (query: string) => {
    const res = await api.get('/stocks/search', { params: { q: query } });
    return z.array(schemas.StockQuoteSchema).parse(res);
  },
  trending: async () => {
    const res = await api.get('/stocks/trending');
    return z.array(schemas.StockQuoteSchema).parse(res);
  },
  gainers: async () => {
    const res = await api.get('/stocks/gainers');
    return z.array(schemas.StockQuoteSchema).parse(res);
  },
  losers: async () => {
    const res = await api.get('/stocks/losers');
    return z.array(schemas.StockQuoteSchema).parse(res);
  },
  indices: async () => {
    return api.get('/market/indices');
  },
  sectorData: async () => {
    return api.get('/market/sectors');
  },
};

// ==========================================
// WATCHLIST SERVICES
// ==========================================
export const WatchlistService = {
  list: async () => {
    const res = await api.get('/watchlist');
    return z.array(schemas.WatchlistSchema).parse(res);
  },
  create: async (payload: z.infer<typeof schemas.CreateWatchlistSchema>) => {
    schemas.CreateWatchlistSchema.parse(payload);
    const res = await api.post('/watchlist', payload);
    return schemas.WatchlistSchema.parse(res);
  },
  update: async (id: string, name: string) => {
    const res = await api.put(`/watchlist/${id}`, { name });
    return schemas.WatchlistSchema.parse(res);
  },
  delete: async (id: string) => {
    return api.delete(`/watchlist/${id}`);
  },
  addStock: async (watchlistId: string, symbol: string) => {
    const res = await api.post(`/watchlist/${watchlistId}/stocks`, { symbol });
    return schemas.WatchlistSchema.parse(res);
  },
  removeStock: async (watchlistId: string, symbol: string) => {
    const res = await api.delete(`/watchlist/${watchlistId}/stocks/${symbol}`);
    return schemas.WatchlistSchema.parse(res);
  },
};

// ==========================================
// PORTFOLIO & ORDER SERVICES
// ==========================================
export const PortfolioService = {
  summary: async () => {
    const res = await api.get('/portfolio/summary');
    return schemas.PortfolioSummarySchema.parse(res);
  },
  holdings: async () => {
    const res = await api.get('/portfolio/holdings');
    return z.array(schemas.HoldingSchema).parse(res);
  },
  performance: async () => {
    return api.get('/portfolio/performance');
  },
  executeTrade: async (payload: { symbol: string; type: 'BUY' | 'SELL'; quantity: number; orderType: string; limitPrice?: number; stopPrice?: number }) => {
    return api.post('/orders', payload);
  },
  transactions: async () => {
    const res = await api.get('/portfolio/transactions');
    return z.array(schemas.WalletTransactionSchema).parse(res);
  },
  analytics: async () => {
    return api.get('/portfolio/analytics');
  },
};

// ==========================================
// WALLET & PAYMENT SERVICES
// ==========================================
export const WalletService = {
  balance: async () => {
    return api.get('/wallet/balance');
  },
  requestDeposit: async (payload: z.infer<typeof schemas.DepositRequestSchema>) => {
    schemas.DepositRequestSchema.parse(payload);
    return api.post('/wallet/deposit', payload);
  },
  requestWithdrawal: async (payload: z.infer<typeof schemas.WithdrawalRequestSchema>) => {
    schemas.WithdrawalRequestSchema.parse(payload);
    return api.post('/wallet/withdraw', payload);
  },
  history: async () => {
    const res = await api.get('/wallet/transactions');
    return z.array(schemas.WalletTransactionSchema).parse(res);
  },
  uploadProof: async (formData: FormData) => {
    return api.post('/wallet/upload-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// ==========================================
// NEWS SERVICES
// ==========================================
export const NewsService = {
  latest: async () => {
    return api.get('/news/latest');
  },
  trending: async () => {
    return api.get('/news/trending');
  },
  company: async (symbol: string) => {
    return api.get(`/news/company/${symbol}`);
  },
  toggleBookmark: async (newsId: string) => {
    return api.post(`/news/bookmark/${newsId}`);
  },
};

// ==========================================
// AI SERVICES
// ==========================================
export const AiService = {
  analyzeStock: async (symbol: string) => {
    return api.post('/ai/analyze', { symbol });
  },
  reviewPortfolio: async () => {
    return api.post('/ai/portfolio-review');
  },
  sentiment: async (symbol: string) => {
    return api.post('/ai/sentiment', { symbol });
  },
  chat: async (message: string) => {
    return api.post('/ai/chat', { message });
  },
  history: async () => {
    return api.get('/ai/history');
  },
};

// ==========================================
// SECURITY SERVICES
// ==========================================
export const SecurityService = {
  settings: async () => {
    return api.get('/security/settings');
  },
  toggle2fa: async (enabled: boolean) => {
    return api.post('/security/2fa', { enabled });
  },
  sessions: async () => {
    return api.get('/security/sessions');
  },
  loginHistory: async () => {
    return api.get('/security/login-history');
  },
  devices: async () => {
    return api.get('/security/devices');
  },
};

// ==========================================
// ALERTS SERVICES
// ==========================================
export const AlertService = {
  list: async () => {
    return api.get('/alerts');
  },
  create: async (alert: z.infer<typeof schemas.AlertTriggerSchema>) => {
    schemas.AlertTriggerSchema.parse(alert);
    return api.post('/alerts', alert);
  },
  update: async (id: string, updates: Partial<z.infer<typeof schemas.AlertTriggerSchema>>) => {
    return api.put(`/alerts/${id}`, updates);
  },
  delete: async (id: string) => {
    return api.delete(`/alerts/${id}`);
  },
  smartAlerts: async () => {
    return api.get('/alerts/smart');
  },
};

// ==========================================
// ADMIN SERVICES
// ==========================================
export const AdminService = {
  getStats: async () => {
    return api.get('/admin/stats');
  },
  kycList: async () => {
    return api.get('/admin/kyc');
  },
  approveKyc: async (userId: string, approve: boolean, notes?: string) => {
    return api.post(`/admin/kyc/${userId}`, { approve, notes });
  },
  deposits: async () => {
    return api.get('/admin/deposits');
  },
  withdrawals: async () => {
    return api.get('/admin/withdrawals');
  },
  approveDeposit: async (depositId: string, approve: boolean, notes?: string) => {
    return api.post(`/admin/deposits/${depositId}`, { approve, notes });
  },
  approveWithdrawal: async (withdrawalId: string, approve: boolean, notes?: string) => {
    return api.post(`/admin/withdrawals/${withdrawalId}`, { approve, notes });
  },
  tickets: async () => {
    return api.get('/admin/tickets');
  },
};
