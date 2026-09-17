// Markets Explorer & Screener Mock Data Layer

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: 'India' | 'Global';
  status: 'OPEN' | 'CLOSED';
  sparkline: number[];
}

export interface SectorPerformance {
  name: string;
  avgReturn: number;
  bestSymbol: string;
  bestChange: number;
  worstSymbol: string;
  worstChange: number;
  sparkline: number[];
}

export interface CalendarEvent {
  id: string;
  type: 'EARNINGS' | 'IPO' | 'DIVIDEND' | 'MACRO';
  title: string;
  date: string;
  impact: 'HIGH' | 'MODERATE' | 'LOW';
  details: Record<string, string | number>;
}

export interface AIMarketInsight {
  bullishSectors: string[];
  bearishSectors: string[];
  sentiment: string;
  riskLevel: 'LOW' | 'NEUTRAL' | 'HIGH' | 'CRITICAL';
  opportunities: { symbol: string; signal: string; target: number }[];
  trendingIndustries: string[];
}

// Initial index statistics
const INITIAL_INDICES: MarketIndex[] = [
  // India
  { symbol: '^NSEI', name: 'Nifty 50', price: 22450.60, change: 110.45, changePercent: 0.49, market: 'India', status: 'OPEN', sparkline: [22320, 22350, 22310, 22390, 22410, 22430, 22450.60] },
  { symbol: '^BSESN', name: 'Sensex', price: 73900.20, change: 350.15, changePercent: 0.48, market: 'India', status: 'OPEN', sparkline: [73500, 73620, 73510, 73700, 73780, 73820, 73900.20] },
  { symbol: '^NSEBANK', name: 'Bank Nifty', price: 47920.80, change: -120.40, changePercent: -0.25, market: 'India', status: 'OPEN', sparkline: [48050, 48010, 47890, 47950, 47860, 47900, 47920.80] },
  { symbol: '^CNXIT', name: 'Nifty IT', price: 35620.10, change: 420.50, changePercent: 1.19, market: 'India', status: 'OPEN', sparkline: [35100, 35210, 35300, 35250, 35480, 35550, 35620.10] },
  { symbol: '^CNXPHARMA', name: 'Nifty Pharma', price: 19120.40, change: 80.20, changePercent: 0.42, market: 'India', status: 'OPEN', sparkline: [19020, 19080, 19010, 19090, 19110, 19080, 19120.40] },
  
  // Global
  { symbol: '^GSPC', name: 'S&P 500', price: 5120.30, change: 35.20, changePercent: 0.69, market: 'Global', status: 'CLOSED', sparkline: [5080, 5092, 5110, 5102, 5108, 5115, 5120.30] },
  { symbol: '^IXIC', name: 'Nasdaq Composite', price: 16180.50, change: 180.45, changePercent: 1.13, market: 'Global', status: 'CLOSED', sparkline: [15980, 16020, 16100, 16050, 16110, 16150, 16180.50] },
  { symbol: '^DJI', name: 'Dow Jones', price: 38920.10, change: -45.60, changePercent: -0.12, market: 'Global', status: 'CLOSED', sparkline: [38980, 38950, 39010, 38900, 38920, 38960, 38920.10] },
  { symbol: '^FTSE', name: 'FTSE 100', price: 7950.40, change: 25.10, changePercent: 0.32, market: 'Global', status: 'CLOSED', sparkline: [7920, 7940, 7915, 7935, 7942, 7948, 7950.40] },
  { symbol: '^N225', name: 'Nikkei 225', price: 38850.60, change: 520.10, changePercent: 1.36, market: 'Global', status: 'CLOSED', sparkline: [38300, 38450, 38520, 38480, 38650, 38780, 38850.60] },
  { symbol: '^HSI', name: 'Hang Seng Index', price: 16720.80, change: -110.50, changePercent: -0.66, market: 'Global', status: 'CLOSED', sparkline: [16850, 16810, 16790, 16750, 16780, 16740, 16720.80] }
];

// Live mutating prices store for indices
let liveIndicesStore: MarketIndex[] = [...INITIAL_INDICES];

export function getIndices(): MarketIndex[] {
  // Simulate minor market fluctuations for indices
  liveIndicesStore = liveIndicesStore.map((idx) => {
    const isGainer = idx.changePercent >= 0;
    const drift = (Math.random() - 0.485) * (idx.price * 0.0006);
    const newPrice = idx.price + drift;
    const change = idx.change + drift;
    const changePercent = (change / (newPrice - change)) * 100;
    const sparkline = [...idx.sparkline.slice(1), Number(newPrice.toFixed(2))];

    return {
      ...idx,
      price: Number(newPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      sparkline
    };
  });
  return liveIndicesStore;
}

export const SECTORS_PERFORMANCE: SectorPerformance[] = [
  { name: 'Technology', avgReturn: 1.45, bestSymbol: 'MSFT', bestChange: 2.10, worstSymbol: 'RXT', worstChange: -4.50, sparkline: [1.1, 1.25, 1.2, 1.38, 1.42, 1.45] },
  { name: 'Banking', avgReturn: -0.15, bestSymbol: 'JPM', bestChange: 0.85, worstSymbol: 'BAC', worstChange: -1.34, sparkline: [0.2, 0.1, -0.05, -0.2, -0.12, -0.15] },
  { name: 'Healthcare', avgReturn: 0.52, bestSymbol: 'JNJ', bestChange: 1.20, worstSymbol: 'PFE', worstChange: -0.85, sparkline: [0.3, 0.42, 0.48, 0.39, 0.5, 0.52] },
  { name: 'Energy', avgReturn: -0.82, bestSymbol: 'CVX', bestChange: 0.15, worstSymbol: 'XOM', worstChange: -1.25, sparkline: [-0.3, -0.5, -0.62, -0.8, -0.75, -0.82] },
  { name: 'Automobile', avgReturn: 2.10, bestSymbol: 'TSLA', bestChange: 4.10, worstSymbol: 'F', worstChange: -0.65, sparkline: [1.2, 1.45, 1.8, 1.62, 1.95, 2.1] },
  { name: 'Consumer', avgReturn: 0.85, bestSymbol: 'AMZN', bestChange: 1.80, worstSymbol: 'WMT', worstChange: -0.20, sparkline: [0.5, 0.62, 0.7, 0.68, 0.8, 0.85] },
  { name: 'Pharmaceutical', avgReturn: 0.35, bestSymbol: 'JNJ', bestChange: 1.20, worstSymbol: 'PFE', worstChange: -0.85, sparkline: [0.1, 0.22, 0.3, 0.25, 0.32, 0.35] },
  { name: 'FMCG', avgReturn: 0.22, bestSymbol: 'PG', bestChange: 0.65, worstSymbol: 'KO', worstChange: -0.30, sparkline: [0.1, 0.15, 0.2, 0.18, 0.24, 0.22] },
  { name: 'Telecom', avgReturn: -0.45, bestSymbol: 'T', bestChange: 0.30, worstSymbol: 'VZ', worstChange: -0.95, sparkline: [-0.1, -0.25, -0.3, -0.42, -0.38, -0.45] },
  { name: 'Real Estate', avgReturn: -1.15, bestSymbol: 'PLD', bestChange: 0.20, worstSymbol: 'AMT', worstChange: -1.85, sparkline: [-0.6, -0.8, -0.95, -1.2, -1.08, -1.15] }
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // Earnings
  { id: 'cal-e1', type: 'EARNINGS', title: 'NVDA Q2 Earnings Release', date: 'Jul 22, 2026', impact: 'HIGH', details: { 'EPS Est': 12.8, 'Revenue Est': '28.4B', Time: 'After Market Close' } },
  { id: 'cal-e2', type: 'EARNINGS', title: 'MSFT Q4 Earnings Release', date: 'Jul 25, 2026', impact: 'HIGH', details: { 'EPS Est': 11.95, 'Revenue Est': '64.5B', Time: 'After Market Close' } },
  { id: 'cal-e3', type: 'EARNINGS', title: 'AAPL Q3 Earnings Release', date: 'Jul 28, 2026', impact: 'HIGH', details: { 'EPS Est': 6.6, 'Revenue Est': '90.2B', Time: 'After Market Close' } },
  
  // IPO
  { id: 'cal-i1', type: 'IPO', title: 'Starlink Satellite Corp IPO', date: 'Jul 30, 2026', impact: 'HIGH', details: { Price: '$45.00', Shares: '120M', Value: '5.4B', Exchange: 'NASDAQ' } },
  { id: 'cal-i2', type: 'IPO', title: 'Ola Electric Limited IPO', date: 'Aug 02, 2026', impact: 'MODERATE', details: { Price: '₹76.00', Shares: '95M', Value: '₹722Cr', Exchange: 'NSE' } },

  // Dividend
  { id: 'cal-d1', type: 'DIVIDEND', title: 'JPM Ex-Dividend Date', date: 'Jul 20, 2026', impact: 'LOW', details: { Amount: '$1.15', Yield: '2.25%', RecordDate: 'Jul 21, 2026' } },
  { id: 'cal-d2', type: 'DIVIDEND', title: 'JNJ Ex-Dividend Date', date: 'Jul 24, 2026', impact: 'LOW', details: { Amount: '$1.24', Yield: '2.92%', RecordDate: 'Jul 25, 2026' } },

  // Macro
  { id: 'cal-m1', type: 'MACRO', title: 'US Fed Interest Rate Decision', date: 'Jul 29, 2026', impact: 'HIGH', details: { Consensus: '5.25%', Previous: '5.50%', Forecast: 'Rate Cut 25bps' } },
  { id: 'cal-m2', type: 'MACRO', title: 'RBI Monetary Policy Committee Meet', date: 'Aug 06, 2026', impact: 'HIGH', details: { Consensus: '6.50%', Previous: '6.50%', Forecast: 'Hold Status Quo' } },
  { id: 'cal-m3', type: 'MACRO', title: 'US CPI Inflation Data Release', date: 'Aug 12, 2026', impact: 'HIGH', details: { Consensus: '3.1%', Previous: '3.3%', Forecast: 'Slight cooling' } }
];

export const AI_INSIGHTS: AIMarketInsight = {
  bullishSectors: ['Technology', 'Automobile', 'Semiconductors'],
  bearishSectors: ['Real Estate', 'Telecom', 'Energy'],
  sentiment: 'Greedy (68/100)',
  riskLevel: 'NEUTRAL',
  opportunities: [
    { symbol: 'PLTR', signal: 'Strong Buy', target: 32.0 },
    { symbol: 'JPM', signal: 'Accumulate', target: 225.0 },
    { symbol: 'BTC-USD', signal: 'Bullish breakout confirmed', target: 75000.0 }
  ],
  trendingIndustries: ['AI Accelerators', 'Fintech Infrastructure', 'Autonomous EVs']
};

export const RECENT_SEARCHES = ['AAPL', 'MSFT', 'NVDA', 'BTC-USD', 'TSLA'];
export const POPULAR_STOCKS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA', 'GOOGL', 'BTC-USD'];
export const TRENDING_STOCKS = ['NVDA', 'PLTR', 'COIN', 'GME', 'TSLA'];
