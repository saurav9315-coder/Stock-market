import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AuthService,
  UserService,
  StockService,
  WatchlistService,
  PortfolioService,
  WalletService,
  NewsService,
  AiService,
  SecurityService,
  AlertService,
  AdminService,
} from '@/lib/services';

// ==========================================
// STOCK & MARKET HOOKS
// ==========================================
export function useStocksList() {
  return useQuery({
    queryKey: ['stocks', 'list'],
    queryFn: () => StockService.list(),
    staleTime: 5000,
    retry: 3,
  });
}

export function useStockDetail(symbol: string) {
  return useQuery({
    queryKey: ['stocks', 'detail', symbol],
    queryFn: () => StockService.detail(symbol),
    enabled: !!symbol,
    staleTime: 5000,
  });
}

export function useStockHistorical(symbol: string, timeRange: string) {
  return useQuery({
    queryKey: ['stocks', 'historical', symbol, timeRange],
    queryFn: () => StockService.historical(symbol, timeRange),
    enabled: !!symbol && !!timeRange,
    staleTime: 10000,
  });
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ['market', 'indices'],
    queryFn: () => StockService.indices(),
    staleTime: 10000,
  });
}

export function useSectorData() {
  return useQuery({
    queryKey: ['market', 'sectors'],
    queryFn: () => StockService.sectorData(),
    staleTime: 10000,
  });
}

// ==========================================
// WATCHLIST HOOKS (WITH OPTIMISTIC UPDATES)
// ==========================================
export function useWatchlists() {
  return useQuery({
    queryKey: ['watchlists'],
    queryFn: () => WatchlistService.list(),
    staleTime: 10000,
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: WatchlistService.create,
    onSuccess: (newWl) => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success(`Watchlist "${newWl.name}" created successfully.`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create watchlist');
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: WatchlistService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Watchlist deleted successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete watchlist');
    },
  });
}

export function useAddStockToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      WatchlistService.addStock(watchlistId, symbol),
    onMutate: async ({ watchlistId, symbol }) => {
      await queryClient.cancelQueries({ queryKey: ['watchlists'] });
      const previousWatchlists = queryClient.getQueryData(['watchlists']);

      queryClient.setQueryData(['watchlists'], (old: any) => {
        if (!old) return old;
        return old.map((wl: any) => {
          if (wl.id === watchlistId) {
            if (wl.symbols.includes(symbol)) return wl;
            return { ...wl, symbols: [...wl.symbols, symbol] };
          }
          return wl;
        });
      });

      return { previousWatchlists };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousWatchlists) {
        queryClient.setQueryData(['watchlists'], context.previousWatchlists);
      }
      toast.error(err.message || `Failed to add ${variables.symbol}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

export function useRemoveStockFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      WatchlistService.removeStock(watchlistId, symbol),
    onMutate: async ({ watchlistId, symbol }) => {
      await queryClient.cancelQueries({ queryKey: ['watchlists'] });
      const previousWatchlists = queryClient.getQueryData(['watchlists']);

      queryClient.setQueryData(['watchlists'], (old: any) => {
        if (!old) return old;
        return old.map((wl: any) => {
          if (wl.id === watchlistId) {
            return { ...wl, symbols: wl.symbols.filter((sym: string) => sym !== symbol) };
          }
          return wl;
        });
      });

      return { previousWatchlists };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousWatchlists) {
        queryClient.setQueryData(['watchlists'], context.previousWatchlists);
      }
      toast.error(err.message || `Failed to remove ${variables.symbol}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

// ==========================================
// PORTFOLIO & ORDERS HOOKS
// ==========================================
export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: () => PortfolioService.summary(),
    staleTime: 5000,
  });
}

export function usePortfolioHoldings() {
  return useQuery({
    queryKey: ['portfolio', 'holdings'],
    queryFn: () => PortfolioService.holdings(),
    staleTime: 5000,
  });
}

export function usePortfolioPerformance() {
  return useQuery({
    queryKey: ['portfolio', 'performance'],
    queryFn: () => PortfolioService.performance(),
    staleTime: 10000,
  });
}

export function usePortfolioTransactions() {
  return useQuery({
    queryKey: ['portfolio', 'transactions'],
    queryFn: () => PortfolioService.transactions(),
    staleTime: 5000,
  });
}

export function usePortfolioAnalytics() {
  return useQuery({
    queryKey: ['portfolio', 'analytics'],
    queryFn: () => PortfolioService.analytics(),
    staleTime: 10000,
  });
}

export function useExecuteTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: PortfolioService.executeTrade,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success(data.message || 'Trade executed successfully.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Execution declined.');
    },
  });
}

// ==========================================
// WALLET HOOKS
// ==========================================
export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: () => WalletService.balance(),
    staleTime: 5000,
  });
}

export function useWalletHistory() {
  return useQuery({
    queryKey: ['wallet', 'history'],
    queryFn: () => WalletService.history(),
    staleTime: 5000,
  });
}

export function useDepositRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: WalletService.requestDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Deposit request dispatched for clearance.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Deposit request failed.');
    },
  });
}

export function useWithdrawalRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: WalletService.requestWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      toast.success('Withdrawal request initialized.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Withdrawal request failed.');
    },
  });
}

// ==========================================
// NEWS HOOKS
// ==========================================
export function useLatestNews() {
  return useQuery({
    queryKey: ['news', 'latest'],
    queryFn: () => NewsService.latest(),
    staleTime: 15000,
  });
}

export function useTrendingNews() {
  return useQuery({
    queryKey: ['news', 'trending'],
    queryFn: () => NewsService.trending(),
    staleTime: 15000,
  });
}

export function useCompanyNews(symbol: string) {
  return useQuery({
    queryKey: ['news', 'company', symbol],
    queryFn: () => NewsService.company(symbol),
    enabled: !!symbol,
    staleTime: 15000,
  });
}

// ==========================================
// AI HOOKS
// ==========================================
export function useAiChatMutation() {
  return useMutation({
    mutationFn: (msg: string) => AiService.chat(msg),
  });
}

export function useAiAnalysis(symbol: string) {
  return useQuery({
    queryKey: ['ai', 'analysis', symbol],
    queryFn: () => AiService.analyzeStock(symbol),
    enabled: !!symbol,
    staleTime: 30000,
  });
}

// ==========================================
// SECURITY HOOKS
// ==========================================
export function useSecuritySettings() {
  return useQuery({
    queryKey: ['security', 'settings'],
    queryFn: () => SecurityService.settings(),
  });
}

export function useToggle2fa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: SecurityService.toggle2fa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
      toast.success('Security Multi-Factor Auth status modified.');
    },
  });
}

// ==========================================
// ALERT HOOKS
// ==========================================
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => AlertService.list(),
  });
}

export function useSmartAlerts() {
  return useQuery({
    queryKey: ['alerts', 'smart'],
    queryFn: () => AlertService.smartAlerts(),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AlertService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Price alert threshold configured.');
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AlertService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Price alert deleted.');
    },
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => AdminService.getStats(),
  });
}

export function useAdminKyc() {
  return useQuery({
    queryKey: ['admin', 'kyc'],
    queryFn: () => AdminService.kycList(),
  });
}

export function useAdminDeposits() {
  return useQuery({
    queryKey: ['admin', 'deposits'],
    queryFn: () => AdminService.deposits(),
  });
}

export function useAdminWithdrawals() {
  return useQuery({
    queryKey: ['admin', 'withdrawals'],
    queryFn: () => AdminService.withdrawals(),
  });
}
