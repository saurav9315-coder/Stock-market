'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPortfolioHoldings, getStockQuote, PortfolioHolding } from '@/lib/stockMock';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  date: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';
  symbol?: string;
  quantity?: number;
  price?: number;
  totalAmount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

export interface InvestmentGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: 'Retirement' | 'Emergency Fund' | 'House Purchase' | 'Education';
  targetDate: string;
}

export interface AIInsight {
  healthScore: number;
  warnings: string[];
  rebalancingAdvice: { asset: string; action: 'BUY' | 'SELL'; currentWeight: number; targetWeight: number }[];
  diversificationAdvice: string;
  recommendedStocks: { symbol: string; name: string; sector: string; reason: string }[];
  sectorOpportunities: string[];
}

export interface PortfolioAnalytics {
  volatility: number; // annualized stdev
  beta: number;
  sharpeRatio: number;
  alpha: number;
  drawdown: number; // max drawdown %
  riskScore: number; // 1-100 scale
  diversificationScore: number; // 1-100 scale (HHI based)
}

export function usePortfolio() {
  // State simulation overrides
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  // Cash balance state
  const [cashBalance, setCashBalance] = useState<number>(18240.50);
  
  // Custom holdings list to track state changes dynamically
  const [customHoldings, setCustomHoldings] = useState<PortfolioHolding[]>([]);

  // Initializing custom holdings
  useEffect(() => {
    setCustomHoldings(getPortfolioHoldings());
  }, []);

  // Update prices periodically to simulate ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setCustomHoldings((prev) =>
        prev.map((holding) => {
          const latest = getStockQuote(holding.symbol);
          return {
            ...holding,
            currentPrice: latest.price,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Investment Goals
  const [goals, setGoals] = useState<InvestmentGoal[]>([
    { id: 'g1', name: 'Retirement 2045', target: 500000, current: 85240, category: 'Retirement', targetDate: '2045-12-31' },
    { id: 'g2', name: 'Rainy Day Fund', target: 25000, current: 18240, category: 'Emergency Fund', targetDate: '2027-06-30' },
    { id: 'g3', name: 'Suburban House Downpayment', target: 120000, current: 40000, category: 'House Purchase', targetDate: '2030-05-01' },
  ]);

  // Transaction Ledger history
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', date: '2026-07-01T10:15:00Z', type: 'DEPOSIT', totalAmount: 10000, status: 'COMPLETED' },
    { id: 't2', date: '2026-07-02T14:30:00Z', type: 'BUY', symbol: 'AAPL', quantity: 15, price: 175.20, totalAmount: 2628.00, status: 'COMPLETED' },
    { id: 't3', date: '2026-07-02T14:35:00Z', type: 'BUY', symbol: 'MSFT', quantity: 8, price: 390.10, totalAmount: 3120.80, status: 'COMPLETED' },
    { id: 't4', date: '2026-07-03T09:45:00Z', type: 'BUY', symbol: 'NVDA', quantity: 5, price: 650.00, totalAmount: 3250.00, status: 'COMPLETED' },
    { id: 't5', date: '2026-07-03T11:15:00Z', type: 'BUY', symbol: 'TSLA', quantity: 12, price: 195.40, totalAmount: 2344.80, status: 'COMPLETED' },
    { id: 't6', date: '2026-07-04T16:00:00Z', type: 'BUY', symbol: 'BTC-USD', quantity: 0.15, price: 58000.00, totalAmount: 8700.00, status: 'COMPLETED' },
    { id: 't7', date: '2026-07-05T08:30:00Z', type: 'DIVIDEND', symbol: 'AAPL', totalAmount: 7.80, status: 'COMPLETED' },
    { id: 't8', date: '2026-07-06T12:00:00Z', type: 'WITHDRAWAL', totalAmount: 500, status: 'COMPLETED' },
  ]);

  // Track if we are loading or have error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger artificial loading states
  useEffect(() => {
    if (simulateLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [simulateLoading]);

  useEffect(() => {
    if (simulateError) {
      setError('Institutional clearing server failed. Connectivity issue status: 503.');
    } else {
      setError(null);
    }
  }, [simulateError]);

  const activeHoldings = useMemo(() => {
    if (simulateEmpty) return [];
    return customHoldings;
  }, [customHoldings, simulateEmpty]);

  // Financial values calculations
  const metrics = useMemo(() => {
    let totalInvested = 0;
    let currentEquityValue = 0;
    
    activeHoldings.forEach((h) => {
      totalInvested += h.quantity * h.avgBuyPrice;
      currentEquityValue += h.quantity * h.currentPrice;
    });

    const netAssetValue = currentEquityValue + cashBalance;
    const totalPnL = netAssetValue - (totalInvested + 18240.50 + 9500); // adjusted based on deposit/withdrawal history
    const unrealizedPnL = currentEquityValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (unrealizedPnL / totalInvested) * 100 : 0;

    // Daily change calculation (simulated from current vs prev closes of assets)
    let dailyChangeValue = 0;
    let yesterdayValue = cashBalance;
    
    activeHoldings.forEach((h) => {
      const quote = getStockQuote(h.symbol);
      const prevValue = h.quantity * quote.prevClose;
      const curValue = h.quantity * h.currentPrice;
      dailyChangeValue += (curValue - prevValue);
      yesterdayValue += prevValue;
    });

    const dailyChangePercent = yesterdayValue > 0 ? (dailyChangeValue / yesterdayValue) * 100 : 0;

    return {
      netAssetValue,
      cashBalance,
      totalInvested,
      currentEquityValue,
      unrealizedPnL,
      realizedPnL: 820.00, // mock realized gains from previous sells
      dailyChangeValue,
      dailyChangePercent,
      totalReturnPercent,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }, [activeHoldings, cashBalance]);

  // Diversification Score & Analytics Metrics
  const analytics: PortfolioAnalytics = useMemo(() => {
    if (activeHoldings.length === 0) {
      return { volatility: 0, beta: 0, sharpeRatio: 0, alpha: 0, drawdown: 0, riskScore: 0, diversificationScore: 0 };
    }

    // Herfindahl-Hirschman Index (HHI) for Sector Diversification
    // HHI = sum(w_i^2) where w_i is percent allocation. A lower HHI means higher diversification.
    const sectorWeights: Record<string, number> = {};
    let totalVal = metrics.currentEquityValue;
    if (totalVal === 0) totalVal = 1;

    activeHoldings.forEach((h) => {
      const val = h.quantity * h.currentPrice;
      sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + (val / totalVal) * 100;
    });

    let hhi = 0;
    Object.values(sectorWeights).forEach((w) => {
      hhi += w * w;
    });
    // HHI scales from 0 to 10000. 10000 = single sector (worst). 1000 = diversified (best).
    // Let's normalize it to a 1-100 diversification score where lower HHI gives a higher score.
    const diversificationScore = Math.max(1, Math.min(100, Math.round(100 - (hhi - 1000) / 90)));

    // Portfolio Beta as weighted average of holding betas
    let weightedBeta = 0;
    activeHoldings.forEach((h) => {
      const quote = getStockQuote(h.symbol);
      const weight = (h.quantity * h.currentPrice) / totalVal;
      weightedBeta += (quote.beta || 1) * weight;
    });

    // Volatility calculation (annualized standard deviation mock based on beta)
    const marketVolatility = 15; // 15% S&P 500 average stdev
    const volatility = Number((weightedBeta * marketVolatility * 1.1).toFixed(2));

    // Sharpe Ratio = (Portfolio Return - Risk Free Rate) / Portfolio Volatility
    // Risk-free rate = 4.25%
    const sharpeRatio = Number(((metrics.totalReturnPercent - 4.25) / volatility).toFixed(2));

    // Alpha = Portfolio Return - [RiskFree + Beta * (Market Return - RiskFree)]
    // Assume S&P return is 12%
    const alpha = Number((metrics.totalReturnPercent - (4.25 + weightedBeta * (12 - 4.25))).toFixed(2));

    // Drawdown simulation
    const drawdown = Number((weightedBeta * 7.5).toFixed(2));

    // Risk score 1-100
    const riskScore = Math.min(100, Math.max(1, Math.round(weightedBeta * 45 + (volatility / 2))));

    return {
      volatility,
      beta: Number(weightedBeta.toFixed(2)),
      sharpeRatio,
      alpha,
      drawdown,
      riskScore,
      diversificationScore,
    };
  }, [activeHoldings, metrics]);

  // Sector and asset allocations calculations
  const allocations = useMemo(() => {
    const totalNav = metrics.netAssetValue || 1;

    // Sector Allocation
    const sectors: Record<string, number> = {};
    activeHoldings.forEach((h) => {
      sectors[h.sector] = (sectors[h.sector] || 0) + h.quantity * h.currentPrice;
    });
    const sectorAllocation = Object.keys(sectors).map((name) => ({
      name,
      value: Number(((sectors[name] / totalNav) * 100).toFixed(2)),
      amount: sectors[name],
    }));

    // Industry Allocation
    const industries: Record<string, number> = {};
    activeHoldings.forEach((h) => {
      const quote = getStockQuote(h.symbol);
      industries[quote.industry || 'Unknown'] = (industries[quote.industry || 'Unknown'] || 0) + h.quantity * h.currentPrice;
    });
    const industryAllocation = Object.keys(industries).map((name) => ({
      name,
      value: Number(((industries[name] / totalNav) * 100).toFixed(2)),
      amount: industries[name],
    })).sort((a, b) => b.value - a.value);

    // Asset Allocation (Cash vs Equity vs Crypto)
    let cryptoValue = 0;
    let equityValue = 0;
    activeHoldings.forEach((h) => {
      if (h.sector === 'Cryptocurrency') {
        cryptoValue += h.quantity * h.currentPrice;
      } else {
        equityValue += h.quantity * h.currentPrice;
      }
    });
    const assetAllocation = [
      { name: 'Cash', value: Number(((cashBalance / totalNav) * 100).toFixed(2)), amount: cashBalance },
      { name: 'Equities', value: Number(((equityValue / totalNav) * 100).toFixed(2)), amount: equityValue },
      { name: 'Cryptocurrencies', value: Number(((cryptoValue / totalNav) * 100).toFixed(2)), amount: cryptoValue },
    ].filter(a => a.amount > 0);

    // Country Allocation
    const countryAllocation = [
      { name: 'United States', value: Number((((equityValue + cashBalance) / totalNav) * 100).toFixed(2)), amount: equityValue + cashBalance },
      { name: 'Global / Decentralized', value: Number(((cryptoValue / totalNav) * 100).toFixed(2)), amount: cryptoValue },
    ].filter(c => c.amount > 0);

    // Market Cap Distribution
    let megacap = 0; // > 200B
    let largecap = 0; // 10B - 200B
    let midcap = 0; // 2B - 10B
    activeHoldings.forEach((h) => {
      const quote = getStockQuote(h.symbol);
      const value = h.quantity * h.currentPrice;
      if (quote.marketCap >= 200e9) {
        megacap += value;
      } else if (quote.marketCap >= 10e9) {
        largecap += value;
      } else {
        midcap += value;
      }
    });

    const marketCapDistribution = [
      { name: 'Mega Cap (> $200B)', value: Number(((megacap / totalNav) * 100).toFixed(2)), amount: megacap },
      { name: 'Large Cap ($10B - $200B)', value: Number(((largecap / totalNav) * 100).toFixed(2)), amount: largecap },
      { name: 'Mid/Small Cap (< $10B)', value: Number(((midcap / totalNav) * 100).toFixed(2)), amount: midcap },
    ].filter(m => m.amount > 0);

    return {
      sectorAllocation,
      industryAllocation,
      assetAllocation,
      countryAllocation,
      marketCapDistribution,
    };
  }, [activeHoldings, cashBalance, metrics]);

  // Top performers list
  const performers = useMemo(() => {
    const list = activeHoldings.map((h) => {
      const costBasis = h.quantity * h.avgBuyPrice;
      const currentVal = h.quantity * h.currentPrice;
      const gain = currentVal - costBasis;
      const gainPct = costBasis > 0 ? (gain / costBasis) * 100 : 0;
      return {
        symbol: h.symbol,
        name: h.name,
        gain,
        gainPct,
      };
    });

    const best = [...list].sort((a, b) => b.gainPct - a.gainPct).slice(0, 3);
    const worst = [...list].sort((a, b) => a.gainPct - b.gainPct).slice(0, 3);

    return { best, worst };
  }, [activeHoldings]);

  // AI Portfolio Insights Panel Data
  const aiInsights: AIInsight = useMemo(() => {
    const healthScore = Math.round(
      (analytics.diversificationScore * 0.4) + 
      (Math.max(0, 100 - analytics.volatility) * 0.3) + 
      (Math.min(100, Math.max(0, (analytics.sharpeRatio + 1) * 40)) * 0.3)
    );

    const warnings: string[] = [];
    if (analytics.diversificationScore < 50) {
      warnings.push('High concentration risk detected. Sector allocation is skewed heavily towards Tech/Semiconductors.');
    }
    if (analytics.volatility > 20) {
      warnings.push('Portfolio volatility exceeds institutional standards. Consider adding cash or low-beta defensive assets.');
    }
    if (cashBalance < metrics.netAssetValue * 0.05) {
      warnings.push('Cash reserves are low (< 5%). Liquidating a small portion of gains could buffer against market pullbacks.');
    }

    // Rebalancing suggestion logic
    const rebalancingAdvice: AIInsight['rebalancingAdvice'] = [];
    let techValue = 0;
    activeHoldings.forEach((h) => {
      if (h.sector === 'Technology') {
        techValue += h.quantity * h.currentPrice;
      }
    });
    const techWeight = metrics.netAssetValue > 0 ? (techValue / metrics.netAssetValue) * 100 : 0;

    if (techWeight > 45) {
      rebalancingAdvice.push({
        asset: 'AAPL',
        action: 'SELL',
        currentWeight: Math.round(techWeight * 0.4),
        targetWeight: Math.round(techWeight * 0.25),
      });
      rebalancingAdvice.push({
        asset: 'Cash',
        action: 'BUY',
        currentWeight: Math.round((cashBalance / metrics.netAssetValue) * 100),
        targetWeight: Math.round((cashBalance / metrics.netAssetValue) * 100 + 15),
      });
    }

    // Diversification advice block
    let diversificationAdvice = 'Your sector distribution is well-hedged. Keep holding structural compounders.';
    if (analytics.diversificationScore < 60) {
      diversificationAdvice = 'You are heavily exposed to mega-cap technology. To increase diversification, allocate capital to Healthcare, Energy, or Consumer Defensive sectors which have lower correlations to tech indices.';
    }

    const recommendedStocks = [
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', reason: 'Strong growth in cloud computing (AWS) and high operating margins. Currently underrepresented in your portfolio.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', reason: 'Trading at attractive valuation multiples with robust free cash flow support.' },
    ];

    const sectorOpportunities = [
      'Industrial infrastructure expansion matches cyclical policy tails.',
      'Defensive consumer staples show attractive dividend risk premiums.',
    ];

    return {
      healthScore,
      warnings,
      rebalancingAdvice,
      diversificationAdvice,
      recommendedStocks,
      sectorOpportunities,
    };
  }, [activeHoldings, analytics, cashBalance, metrics]);

  // Dividend Tracker computations
  const dividends = useMemo(() => {
    let annualIncome = 0;
    activeHoldings.forEach((h) => {
      const quote = getStockQuote(h.symbol);
      const yieldPct = quote.dividendYield || 0;
      annualIncome += (h.quantity * h.currentPrice) * (yieldPct / 100);
    });

    const averageYield = metrics.currentEquityValue > 0 ? (annualIncome / metrics.currentEquityValue) * 100 : 0;

    const upcoming = activeHoldings
      .filter((h) => {
        const quote = getStockQuote(h.symbol);
        return (quote.dividendYield || 0) > 0;
      })
      .map((h) => {
        const quote = getStockQuote(h.symbol);
        const payout = (h.quantity * h.currentPrice) * ((quote.dividendYield || 0) / 400); // quarterly estimate
        return {
          symbol: h.symbol,
          company: h.name,
          payout,
          exDate: '2026-07-28',
          payDate: '2026-08-15',
        };
      });

    // Dividend payout history list
    const history = transactions
      .filter((t) => t.type === 'DIVIDEND')
      .map((t) => ({
        date: t.date.split('T')[0],
        symbol: t.symbol || 'AAPL',
        amount: t.totalAmount,
      }));

    return {
      annualIncome,
      averageYield,
      upcoming,
      history,
    };
  }, [activeHoldings, metrics, transactions]);

  // Performance chart generator depending on selected range
  const getHistoricalPerformance = useCallback((range: string) => {
    let pointsCount = 30;
    const now = Date.now();
    let stepTime = 24 * 60 * 60 * 1000;
    let portfolioStartValue = metrics.netAssetValue * 0.90;
    let benchmarkStartValue = metrics.netAssetValue * 0.92;

    switch (range) {
      case '1D':
        pointsCount = 24;
        stepTime = 60 * 60 * 1000; // Hourly
        portfolioStartValue = metrics.netAssetValue - metrics.dailyChangeValue;
        benchmarkStartValue = portfolioStartValue * 1.002;
        break;
      case '1W':
        pointsCount = 7;
        stepTime = 24 * 60 * 60 * 1000;
        portfolioStartValue = metrics.netAssetValue * 0.96;
        benchmarkStartValue = metrics.netAssetValue * 0.97;
        break;
      case '1M':
        pointsCount = 30;
        stepTime = 24 * 60 * 60 * 1000;
        portfolioStartValue = metrics.netAssetValue * 0.91;
        benchmarkStartValue = metrics.netAssetValue * 0.93;
        break;
      case '3M':
        pointsCount = 90;
        stepTime = 24 * 60 * 60 * 1000;
        portfolioStartValue = metrics.netAssetValue * 0.82;
        benchmarkStartValue = metrics.netAssetValue * 0.86;
        break;
      case '6M':
        pointsCount = 180;
        stepTime = 24 * 60 * 60 * 1000;
        portfolioStartValue = metrics.netAssetValue * 0.75;
        benchmarkStartValue = metrics.netAssetValue * 0.78;
        break;
      case 'YTD':
        pointsCount = 120;
        stepTime = 24 * 60 * 60 * 1000;
        portfolioStartValue = metrics.netAssetValue * 0.80;
        benchmarkStartValue = metrics.netAssetValue * 0.82;
        break;
      case '1Y':
        pointsCount = 250;
        stepTime = 24 * 60 * 60 * 1000;
        portfolioStartValue = metrics.netAssetValue * 0.65;
        benchmarkStartValue = metrics.netAssetValue * 0.72;
        break;
      case '5Y':
        pointsCount = 60;
        stepTime = 30 * 24 * 60 * 60 * 1000; // Monthly
        portfolioStartValue = metrics.netAssetValue * 0.35;
        benchmarkStartValue = metrics.netAssetValue * 0.48;
        break;
      case 'MAX':
      default:
        pointsCount = 100;
        stepTime = 30 * 24 * 60 * 60 * 1000; // Monthly
        portfolioStartValue = metrics.netAssetValue * 0.20;
        benchmarkStartValue = metrics.netAssetValue * 0.35;
        break;
    }

    const data = [];
    let currentPort = portfolioStartValue;
    let currentBench = benchmarkStartValue;

    for (let i = pointsCount; i >= 0; i--) {
      const ts = now - i * stepTime;
      const dateObj = new Date(ts);
      let label = '';
      if (range === '1D') {
        label = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (range === '1W' || range === '1M') {
        label = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        label = dateObj.toLocaleDateString([], { year: '2-digit', month: 'short' });
      }

      // Add stochastic random walk
      const ratio = (pointsCount - i) / pointsCount;
      const driftPort = (metrics.netAssetValue - currentPort) * (0.08 * ratio);
      const driftBench = (metrics.netAssetValue * 0.98 - currentBench) * (0.06 * ratio);

      const changePort = (Math.random() - 0.47) * 0.015 * currentPort;
      const changeBench = (Math.random() - 0.485) * 0.012 * currentBench;

      currentPort = currentPort + changePort + driftPort;
      currentBench = currentBench + changeBench + driftBench;

      if (i === 0) {
        currentPort = metrics.netAssetValue;
        currentBench = metrics.netAssetValue * 0.975;
      }

      data.push({
        name: label,
        Portfolio: Number(currentPort.toFixed(2)),
        Benchmark: Number(currentBench.toFixed(2)),
      });
    }

    return data;
  }, [metrics]);

  // Actions
  const addFunds = useCallback((amount: number) => {
    if (amount <= 0) return;
    setCashBalance((prev) => prev + amount);
    
    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'DEPOSIT',
      totalAmount: amount,
      status: 'COMPLETED',
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Funds added: $${amount.toLocaleString()} deposited successfully.`);
  }, []);

  const withdrawFunds = useCallback((amount: number) => {
    if (amount <= 0) return;
    if (cashBalance < amount) {
      toast.error('Insufficient cash reserves.');
      return;
    }
    setCashBalance((prev) => prev - amount);
    
    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'WITHDRAWAL',
      totalAmount: amount,
      status: 'COMPLETED',
    };
    setTransactions((prev) => [newTx, ...prev]);
    toast.success(`Funds withdrawn: $${amount.toLocaleString()} successfully transferred.`);
  }, [cashBalance]);

  const executeTradeAction = useCallback((symbol: string, quantity: number, type: 'BUY' | 'SELL') => {
    if (quantity <= 0) {
      toast.error('Invalid trade quantity.');
      return;
    }
    const quote = getStockQuote(symbol);
    const totalAmount = quantity * quote.price;

    if (type === 'BUY' && cashBalance < totalAmount) {
      toast.error(`Insufficient buying power.`);
      return;
    }

    setCustomHoldings((prev) => {
      const idx = prev.findIndex((h) => h.symbol === symbol);
      const nextHoldings = [...prev];

      if (type === 'BUY') {
        setCashBalance((c) => c - totalAmount);
        if (idx >= 0) {
          const prevQty = nextHoldings[idx].quantity;
          const prevAvg = nextHoldings[idx].avgBuyPrice;
          const newQty = prevQty + quantity;
          const newAvg = (prevQty * prevAvg + totalAmount) / newQty;
          nextHoldings[idx] = {
            ...nextHoldings[idx],
            quantity: newQty,
            avgBuyPrice: Number(newAvg.toFixed(2)),
            currentPrice: quote.price,
          };
        } else {
          nextHoldings.push({
            symbol,
            name: quote.name,
            quantity,
            avgBuyPrice: quote.price,
            currentPrice: quote.price,
            sector: quote.sector || 'Technology',
          });
        }
        toast.success(`Trade Executed: Bought ${quantity} share(s) of ${symbol} at $${quote.price}`);
      } else {
        if (idx < 0 || nextHoldings[idx].quantity < quantity) {
          toast.error(`Insufficient shares to sell.`);
          return prev;
        }
        
        setCashBalance((c) => c + totalAmount);
        const nextQty = nextHoldings[idx].quantity - quantity;
        
        if (nextQty <= 0) {
          nextHoldings.splice(idx, 1);
        } else {
          nextHoldings[idx] = {
            ...nextHoldings[idx],
            quantity: nextQty,
          };
        }
        toast.success(`Trade Executed: Sold ${quantity} share(s) of ${symbol} at $${quote.price}`);
      }

      const newTx: Transaction = {
        id: `t-${Date.now()}`,
        date: new Date().toISOString(),
        type,
        symbol,
        quantity,
        price: quote.price,
        totalAmount,
        status: 'COMPLETED',
      };
      setTransactions((t) => [newTx, ...t]);

      return nextHoldings;
    });
  }, [cashBalance]);

  const addGoal = useCallback((name: string, target: number, category: InvestmentGoal['category'], date: string) => {
    if (!name || target <= 0) {
      toast.error('Invalid goal parameter values.');
      return;
    }
    const newGoal: InvestmentGoal = {
      id: `g-${Date.now()}`,
      name,
      target,
      current: 0,
      category,
      targetDate: date || '2030-12-31',
    };
    setGoals((prev) => [...prev, newGoal]);
    toast.success(`Goal created: Milestone "${name}" successfully listed.`);
  }, []);

  const updateGoalProgress = useCallback((goalId: string, amount: number) => {
    if (amount <= 0) return;
    if (cashBalance < amount) {
      toast.error('Insufficient cash balance to allocate to goals.');
      return;
    }
    setCashBalance((c) => c - amount);
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextVal = g.current + amount;
          toast.success(`Allocated $${amount.toLocaleString()} to goal "${g.name}"`);
          return {
            ...g,
            current: nextVal,
          };
        }
        return g;
      })
    );
  }, [cashBalance]);

  const exportPortfolio = useCallback(() => {
    const dataStr = JSON.stringify({ cashBalance, customHoldings, transactions, goals }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `Antigravity_Portfolio_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Portfolio JSON configuration file compiled and downloaded.');
  }, [cashBalance, customHoldings, transactions, goals]);

  const importPortfolio = useCallback((jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.cashBalance !== undefined) setCashBalance(parsed.cashBalance);
      if (parsed.customHoldings !== undefined) setCustomHoldings(parsed.customHoldings);
      if (parsed.transactions !== undefined) setTransactions(parsed.transactions);
      if (parsed.goals !== undefined) setGoals(parsed.goals);
      toast.success('Portfolio structure configuration successfully loaded from JSON.');
    } catch {
      toast.error('JSON configuration parsing failed. Please verify schema structure.');
    }
  }, []);

  const generatePDFReport = useCallback(() => {
    toast.info('Initiating institutional PDF compilation...');
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
        toast.success('PDF print command dispatched to system print services.');
      }
    }, 1200);
  }, []);

  const generateCSVReport = useCallback(() => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Symbol,Company,Quantity,Average Buy Price,Current Price,Market Value,Total Profit/Loss,Weight (%)\n';
    
    activeHoldings.forEach((h) => {
      const val = h.quantity * h.currentPrice;
      const cost = h.quantity * h.avgBuyPrice;
      const pnl = val - cost;
      const weight = (val / metrics.netAssetValue) * 100;
      csvContent += `"${h.symbol}","${h.name}",${h.quantity},${h.avgBuyPrice},${h.currentPrice},${val.toFixed(2)},${pnl.toFixed(2)},${weight.toFixed(2)}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Portfolio_Holdings_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success('CSV spreadsheet summary successfully compiled.');
  }, [activeHoldings, metrics]);

  const sharePortfolio = useCallback(() => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/portfolio/preview?hash=${btoa(JSON.stringify({ n: 'Quant Portfolio', v: metrics.netAssetValue }))}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Secure portfolio snapshot URL copied to clipboard.');
      }).catch(() => {
        toast.error('Clipboard copy failed.');
      });
    }
  }, [metrics]);

  return {
    simulateLoading,
    setSimulateLoading,
    simulateError,
    setSimulateError,
    simulateEmpty,
    setSimulateEmpty,

    isLoading,
    error,
    holdings: activeHoldings,
    metrics,
    analytics,
    allocations,
    performers,
    aiInsights,
    dividends,
    transactions,
    goals,
    cashBalance,

    getHistoricalPerformance,

    addFunds,
    withdrawFunds,
    executeTradeAction,
    addGoal,
    updateGoalProgress,
    exportPortfolio,
    importPortfolio,
    generatePDFReport,
    generateCSVReport,
    sharePortfolio,
  };
}
