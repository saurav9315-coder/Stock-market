export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  beta: number;
  fiftyTwoWeekRange: { low: number; high: number };
  recommendations: { buy: number; hold: number; sell: number };
  targetPrice: number;
  roe: number;
  sharesOutstanding: string;
  avgVolume: string;
  industry: string;
  sector: string;
  grossMargin: number;
  operatingMargin: number;
  freeCashFlow: string;
  cashFlow: string;
  totalAssets: string;
  totalLiabilities: string;
}

export interface ChartDataPoint {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  ema12?: number;
  bbUpper?: number;
  bbLower?: number;
  bbMiddle?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  symbol?: string;
  impactPercent?: number;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  sector: string;
}

// Initial mock base metrics
export const STOCKS_METRICS: Record<string, Omit<StockQuote, 'price' | 'change' | 'changePercent' | 'open' | 'high' | 'low' | 'volume'>> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    prevClose: 182.52,
    marketCap: 2850000000000,
    peRatio: 28.4,
    eps: 6.43,
    dividendYield: 0.52,
    beta: 1.12,
    fiftyTwoWeekRange: { low: 164.08, high: 199.62 },
    recommendations: { buy: 24, hold: 8, sell: 2 },
    targetPrice: 210.0,
    roe: 154.2,
    sharesOutstanding: '15.6B',
    avgVolume: '52.4M',
    industry: 'Consumer Electronics',
    sector: 'Technology',
    grossMargin: 44.8,
    operatingMargin: 30.1,
    freeCashFlow: '$110.5B',
    cashFlow: '$122.3B',
    totalAssets: '$352.6B',
    totalLiabilities: '$290.4B',
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    prevClose: 415.5,
    marketCap: 3090000000000,
    peRatio: 36.2,
    eps: 11.48,
    dividendYield: 0.72,
    beta: 0.90,
    fiftyTwoWeekRange: { low: 315.18, high: 430.82 },
    recommendations: { buy: 35, hold: 3, sell: 0 },
    targetPrice: 475.0,
    roe: 38.5,
    sharesOutstanding: '7.43B',
    avgVolume: '24.8M',
    industry: 'Infrastructure Software',
    sector: 'Technology',
    grossMargin: 68.9,
    operatingMargin: 43.2,
    freeCashFlow: '$84.2B',
    cashFlow: '$95.9B',
    totalAssets: '$470.5B',
    totalLiabilities: '$219.5B',
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    prevClose: 875.12,
    marketCap: 2190000000000,
    peRatio: 72.8,
    eps: 12.02,
    dividendYield: 0.02,
    beta: 1.68,
    fiftyTwoWeekRange: { low: 262.2, high: 974.0 },
    recommendations: { buy: 42, hold: 4, sell: 1 },
    targetPrice: 1000.0,
    roe: 91.5,
    sharesOutstanding: '2.46B',
    avgVolume: '48.2M',
    industry: 'Semiconductors',
    sector: 'Technology',
    grossMargin: 76.2,
    operatingMargin: 54.1,
    freeCashFlow: '$39.2B',
    cashFlow: '$42.5B',
    totalAssets: '$65.7B',
    totalLiabilities: '$22.8B',
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    prevClose: 175.34,
    marketCap: 558000000000,
    peRatio: 40.5,
    eps: 4.33,
    dividendYield: 0,
    beta: 2.10,
    fiftyTwoWeekRange: { low: 138.8, high: 299.29 },
    recommendations: { buy: 12, hold: 18, sell: 9 },
    targetPrice: 185.0,
    roe: 14.8,
    sharesOutstanding: '3.18B',
    avgVolume: '92.4M',
    industry: 'Auto Manufacturers',
    sector: 'Consumer Cyclical',
    grossMargin: 18.2,
    operatingMargin: 9.6,
    freeCashFlow: '$4.4B',
    cashFlow: '$13.2B',
    totalAssets: '$104.5B',
    totalLiabilities: '$43.0B',
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    prevClose: 178.15,
    marketCap: 1850000000000,
    peRatio: 42.1,
    eps: 4.23,
    dividendYield: 0,
    beta: 1.15,
    fiftyTwoWeekRange: { low: 97.71, high: 189.77 },
    recommendations: { buy: 38, hold: 2, sell: 0 },
    targetPrice: 220.0,
    roe: 22.4,
    sharesOutstanding: '10.3B',
    avgVolume: '38.5M',
    industry: 'Internet Retail',
    sector: 'Consumer Cyclical',
    grossMargin: 46.5,
    operatingMargin: 7.8,
    freeCashFlow: '$32.2B',
    cashFlow: '$54.1B',
    totalAssets: '$420.5B',
    totalLiabilities: '$210.3B',
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    prevClose: 151.6,
    marketCap: 1890000000000,
    peRatio: 26.1,
    eps: 5.81,
    dividendYield: 0.53,
    beta: 1.05,
    fiftyTwoWeekRange: { low: 102.63, high: 160.22 },
    recommendations: { buy: 31, hold: 7, sell: 1 },
    targetPrice: 178.0,
    roe: 28.2,
    sharesOutstanding: '12.5B',
    avgVolume: '28.1M',
    industry: 'Internet Content & Information',
    sector: 'Technology',
    grossMargin: 56.4,
    operatingMargin: 26.5,
    freeCashFlow: '$69.5B',
    cashFlow: '$91.2B',
    totalAssets: '$380.2B',
    totalLiabilities: '$110.5B',
  },
  'BTC-USD': {
    symbol: 'BTC-USD',
    name: 'Bitcoin USD',
    prevClose: 67840.0,
    marketCap: 1330000000000,
    peRatio: 0,
    eps: 0,
    dividendYield: 0,
    beta: 1.85,
    fiftyTwoWeekRange: { low: 24800, high: 73750 },
    recommendations: { buy: 18, hold: 12, sell: 2 },
    targetPrice: 85000.0,
    roe: 0,
    sharesOutstanding: '19.7M',
    avgVolume: '32.4B',
    industry: 'Cryptocurrency',
    sector: 'Cryptocurrency',
    grossMargin: 0,
    operatingMargin: 0,
    freeCashFlow: '$0B',
    cashFlow: '$0B',
    totalAssets: '$1.3T',
    totalLiabilities: '$0B',
  },
  SPY: {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    prevClose: 512.3,
    marketCap: 502000000000,
    peRatio: 23.5,
    eps: 21.8,
    dividendYield: 1.32,
    beta: 1.0,
    fiftyTwoWeekRange: { low: 393.3, high: 524.61 },
    recommendations: { buy: 15, hold: 10, sell: 1 },
    targetPrice: 550.0,
    roe: 18.5,
    sharesOutstanding: '950M',
    avgVolume: '82.4M',
    industry: 'Exchange Traded Fund',
    sector: 'Diversified',
    grossMargin: 0,
    operatingMargin: 0,
    freeCashFlow: '$0B',
    cashFlow: '$0B',
    totalAssets: '$502B',
    totalLiabilities: '$0B',
  },
  JNJ: {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    prevClose: 156.4,
    marketCap: 375000000000,
    peRatio: 15.6,
    eps: 10.02,
    dividendYield: 2.92,
    beta: 0.54,
    fiftyTwoWeekRange: { low: 144.52, high: 175.24 },
    recommendations: { buy: 16, hold: 10, sell: 2 },
    targetPrice: 172.0,
    roe: 25.4,
    sharesOutstanding: '2.4B',
    avgVolume: '6.2M',
    industry: 'Drug Manufacturers - General',
    sector: 'Healthcare',
    grossMargin: 67.5,
    operatingMargin: 20.8,
    freeCashFlow: '$18.2B',
    cashFlow: '$22.4B',
    totalAssets: '$185.6B',
    totalLiabilities: '$112.4B',
  },
  PFE: {
    symbol: 'PFE',
    name: 'Pfizer Inc.',
    prevClose: 28.1,
    marketCap: 158000000000,
    peRatio: 12.4,
    eps: 2.26,
    dividendYield: 5.98,
    beta: 0.62,
    fiftyTwoWeekRange: { low: 25.2, high: 41.5 },
    recommendations: { buy: 11, hold: 15, sell: 1 },
    targetPrice: 35.0,
    roe: 11.2,
    sharesOutstanding: '5.6B',
    avgVolume: '22.4M',
    industry: 'Drug Manufacturers - General',
    sector: 'Healthcare',
    grossMargin: 59.2,
    operatingMargin: 15.4,
    freeCashFlow: '$8.5B',
    cashFlow: '$11.8B',
    totalAssets: '$92.4B',
    totalLiabilities: '$48.5B',
  },
  JPM: {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    prevClose: 195.2,
    marketCap: 560000000000,
    peRatio: 11.8,
    eps: 16.54,
    dividendYield: 2.25,
    beta: 1.1,
    fiftyTwoWeekRange: { low: 123.11, high: 200.94 },
    recommendations: { buy: 22, hold: 8, sell: 0 },
    targetPrice: 215.0,
    roe: 16.8,
    sharesOutstanding: '2.8B',
    avgVolume: '9.8M',
    industry: 'Banks - Diversified',
    sector: 'Financials',
    grossMargin: 0,
    operatingMargin: 34.2,
    freeCashFlow: '$0B',
    cashFlow: '$44.5B',
    totalAssets: '$3.8T',
    totalLiabilities: '$3.5T',
  },
  BAC: {
    symbol: 'BAC',
    name: 'Bank of America Corporation',
    prevClose: 37.5,
    marketCap: 295000000000,
    peRatio: 9.4,
    eps: 3.98,
    dividendYield: 2.56,
    beta: 1.34,
    fiftyTwoWeekRange: { low: 24.96, high: 38.86 },
    recommendations: { buy: 15, hold: 12, sell: 1 },
    targetPrice: 42.0,
    roe: 10.4,
    sharesOutstanding: '7.8B',
    avgVolume: '38.2M',
    industry: 'Banks - Diversified',
    sector: 'Financials',
    grossMargin: 0,
    operatingMargin: 28.5,
    freeCashFlow: '$0B',
    cashFlow: '$26.8B',
    totalAssets: '$3.2T',
    totalLiabilities: '$2.9T',
  },
  COIN: {
    symbol: 'COIN',
    name: 'Coinbase Global, Inc.',
    prevClose: 242.5,
    marketCap: 58000000000,
    peRatio: 38.2,
    eps: 6.34,
    dividendYield: 0.0,
    beta: 2.45,
    fiftyTwoWeekRange: { low: 46.43, high: 283.48 },
    recommendations: { buy: 12, hold: 10, sell: 6 },
    targetPrice: 280.0,
    roe: 18.2,
    sharesOutstanding: '240M',
    avgVolume: '8.5M',
    industry: 'Financial Technology',
    sector: 'Financials',
    grossMargin: 85.6,
    operatingMargin: 24.1,
    freeCashFlow: '$1.8B',
    cashFlow: '$2.4B',
    totalAssets: '$24.5B',
    totalLiabilities: '$18.2B',
  },
  PLTR: {
    symbol: 'PLTR',
    name: 'Palantir Technologies Inc.',
    prevClose: 23.4,
    marketCap: 52000000000,
    peRatio: 82.5,
    eps: 0.28,
    dividendYield: 0.0,
    beta: 1.62,
    fiftyTwoWeekRange: { low: 7.28, high: 27.5 },
    recommendations: { buy: 9, hold: 11, sell: 5 },
    targetPrice: 28.0,
    roe: 8.5,
    sharesOutstanding: '2.2B',
    avgVolume: '42.4M',
    industry: 'Software - Infrastructure',
    sector: 'Technology',
    grossMargin: 81.2,
    operatingMargin: 12.8,
    freeCashFlow: '$850M',
    cashFlow: '$980M',
    totalAssets: '$4.2B',
    totalLiabilities: '$920M',
  },
  RXT: {
    symbol: 'RXT',
    name: 'Rackspace Technology, Inc.',
    prevClose: 2.1,
    marketCap: 450000000,
    peRatio: 0.0,
    eps: -0.45,
    dividendYield: 0.0,
    beta: 1.82,
    fiftyTwoWeekRange: { low: 1.05, high: 3.85 },
    recommendations: { buy: 1, hold: 4, sell: 3 },
    targetPrice: 3.5,
    roe: -12.4,
    sharesOutstanding: '214M',
    avgVolume: '1.8M',
    industry: 'Information Technology Services',
    sector: 'Technology',
    grossMargin: 28.4,
    operatingMargin: -4.5,
    freeCashFlow: '$-24M',
    cashFlow: '$15M',
    totalAssets: '$1.8B',
    totalLiabilities: '$2.1B',
  },
  GME: {
    symbol: 'GME',
    name: 'GameStop Corp.',
    prevClose: 18.2,
    marketCap: 5500000000,
    peRatio: 220.0,
    eps: 0.08,
    dividendYield: 0.0,
    beta: 2.15,
    fiftyTwoWeekRange: { low: 11.83, high: 64.83 },
    recommendations: { buy: 0, hold: 2, sell: 3 },
    targetPrice: 15.0,
    roe: 1.2,
    sharesOutstanding: '305M',
    avgVolume: '4.8M',
    industry: 'Specialty Retail',
    sector: 'Consumer Cyclical',
    grossMargin: 24.5,
    operatingMargin: 0.4,
    freeCashFlow: '$120M',
    cashFlow: '$180M',
    totalAssets: '$3.4B',
    totalLiabilities: '$1.2B',
  },
};

// Global pricing state (mutable to simulate live ticks)
const livePrices: Record<string, { price: number; volume: number; high: number; low: number; open: number }> = {};

// Initialize live prices deterministically to prevent hydration mismatch
Object.keys(STOCKS_METRICS).forEach((sym) => {
  const metric = STOCKS_METRICS[sym];
  livePrices[sym] = {
    price: metric.prevClose,
    open: metric.prevClose,
    high: Number((metric.prevClose * 1.01).toFixed(2)),
    low: Number((metric.prevClose * 0.99).toFixed(2)),
    volume: 1200000,
  };
});

// Tick simulated updates
export function tickMarketData() {
  Object.keys(STOCKS_METRICS).forEach((sym) => {
    const prev = livePrices[sym];
    const metric = STOCKS_METRICS[sym];
    // Random walk with drift (0.01% - 0.05% max tick size depending on beta)
    const volatility = (metric.beta || 1) * 0.0008;
    const changePercent = (Math.random() - 0.49) * volatility; // slight upward drift
    const priceDelta = prev.price * changePercent;
    const newPrice = prev.price + priceDelta;

    prev.price = Number(newPrice.toFixed(2));
    prev.high = Number(Math.max(prev.high, newPrice).toFixed(2));
    prev.low = Number(Math.min(prev.low, newPrice).toFixed(2));
    prev.volume += Math.floor(Math.random() * 5000) + 100;
  });
}

// Tick market every 3 seconds in client environment
if (typeof window !== 'undefined') {
  setInterval(tickMarketData, 3000);
}

export function getStockQuote(symbol: string): StockQuote {
  const meta = STOCKS_METRICS[symbol] || STOCKS_METRICS.AAPL;
  const live = livePrices[symbol] || {
    price: meta.prevClose,
    open: meta.prevClose,
    high: meta.prevClose * 1.01,
    low: meta.prevClose * 0.99,
    volume: 1200000,
  };

  const change = live.price - meta.prevClose;
  const changePercent = (change / meta.prevClose) * 100;

  return {
    ...meta,
    price: live.price,
    open: Number(live.open.toFixed(2)),
    high: live.high,
    low: live.low,
    volume: live.volume,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
  };
}

export function getAllQuotes(): StockQuote[] {
  return Object.keys(STOCKS_METRICS).map(getStockQuote);
}

// Generate high fidelity historical chart data
export function getChartData(symbol: string, range: string): ChartDataPoint[] {
  const quote = getStockQuote(symbol);
  const data: ChartDataPoint[] = [];
  let pointsCount = 100;
  let timeIntervalMinutes = 5;
  const now = Date.now();
  let basePrice = quote.prevClose * 0.95; // start lower than current price for upward historical trend

  switch (range) {
    case '1D':
      pointsCount = 78; // 6.5 hours in 5 min increments
      timeIntervalMinutes = 5;
      basePrice = quote.open;
      break;
    case '5D':
      pointsCount = 65; // 5 days, 13 ticks per day (30 mins)
      timeIntervalMinutes = 30;
      basePrice = quote.prevClose * 0.98;
      break;
    case '1M':
      pointsCount = 30; // 30 days
      timeIntervalMinutes = 1440;
      basePrice = quote.price * 0.92;
      break;
    case '3M':
      pointsCount = 90;
      timeIntervalMinutes = 1440;
      basePrice = quote.price * 0.85;
      break;
    case '1Y':
      pointsCount = 250; // approx trading days in a year
      timeIntervalMinutes = 1440;
      basePrice = quote.price * 0.70;
      break;
    case 'YTD':
      pointsCount = 120;
      timeIntervalMinutes = 1440;
      basePrice = quote.price * 0.88;
      break;
    case 'ALL':
    default:
      pointsCount = 500;
      timeIntervalMinutes = 1440;
      basePrice = quote.price * 0.35;
      break;
  }

  const stepTime = timeIntervalMinutes * 60 * 1000;
  let tempPrice = basePrice;

  for (let i = pointsCount; i >= 0; i--) {
    const pointTimestamp = now - i * stepTime;
    const dateObj = new Date(pointTimestamp);

    // Skip weekends for daily charts, except for crypto (BTC-USD)
    if (timeIntervalMinutes === 1440 && symbol !== 'BTC-USD') {
      const day = dateObj.getDay();
      if (day === 0 || day === 6) continue; // Skip Sat/Sun
    }

    const volatility = (quote.beta || 1) * (timeIntervalMinutes === 1440 ? 0.015 : 0.003);
    // Stochastic drift towards current price
    const progress = (pointsCount - i) / pointsCount;
    const targetPrice = quote.price;
    const drift = (targetPrice - tempPrice) * (0.05 * progress);

    const changePercent = (Math.random() - 0.485) * volatility;
    const priceDelta = tempPrice * changePercent + drift;
    
    const open = tempPrice;
    const close = Math.max(tempPrice + priceDelta, 0.01);
    const high = Math.max(open, close) * (1 + Math.random() * (volatility * 0.4));
    const low = Math.min(open, close) * (1 - Math.random() * (volatility * 0.4));
    const volume = Math.floor(Math.random() * 500000 * (quote.beta || 1)) + (timeIntervalMinutes === 1440 ? 2000000 : 50000);

    let timeStr = '';
    if (timeIntervalMinutes === 5 || timeIntervalMinutes === 30) {
      timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timeStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    data.push({
      time: timeStr,
      timestamp: pointTimestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    tempPrice = close;
  }

  // Force last point to match current live price
  if (data.length > 0) {
    const last = data[data.length - 1];
    last.close = quote.price;
    if (last.high < quote.price) last.high = quote.price;
    if (last.low > quote.price) last.low = quote.price;
  }

  // Apply Technical Indicators (SMA, EMA, Bollinger Bands)
  return calculateTechnicalIndicators(data);
}

function calculateTechnicalIndicators(data: ChartDataPoint[]): ChartDataPoint[] {
  // 1. SMA 20
  for (let i = 0; i < data.length; i++) {
    if (i >= 19) {
      const sum = data.slice(i - 19, i + 1).reduce((acc, p) => acc + p.close, 0);
      data[i].sma20 = Number((sum / 20).toFixed(2));
    }
  }

  // 2. EMA 12
  let prevEma = data[0].close;
  data[0].ema12 = prevEma;
  const k = 2 / (12 + 1);
  for (let i = 1; i < data.length; i++) {
    const ema = data[i].close * k + prevEma * (1 - k);
    data[i].ema12 = Number(ema.toFixed(2));
    prevEma = ema;
  }

  // 3. Bollinger Bands (20 periods, 2 std deviations)
  for (let i = 0; i < data.length; i++) {
    if (i >= 19) {
      const sma = data[i].sma20 || data[i].close;
      const slice = data.slice(i - 19, i + 1);
      const avg = sumClose(slice) / 20;
      const squareDiffs = slice.map((p) => Math.pow(p.close - avg, 2));
      const variance = squareDiffs.reduce((acc, val) => acc + val, 0) / 20;
      const stdDev = Math.sqrt(variance);

      data[i].bbMiddle = sma;
      data[i].bbUpper = Number((sma + 2 * stdDev).toFixed(2));
      data[i].bbLower = Number((sma - 2 * stdDev).toFixed(2));
    }
  }

  return data;
}

function sumClose(points: ChartDataPoint[]): number {
  return points.reduce((acc, p) => acc + p.close, 0);
}

// Mock News
export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'NVIDIA CEO Unveils Ultra-Premium Blackwell AI Architectures at Summit',
    source: 'Bloomberg',
    time: '24m ago',
    summary: 'NVIDIA CEO Jensen Huang showcased next-generation enterprise chip solutions during a packed keynote, prompting a surge in chipmaker premarket indicators.',
    sentiment: 'positive',
    symbol: 'NVDA',
    impactPercent: 3.2,
  },
  {
    id: 'n2',
    title: 'Federal Reserve Signals Higher-for-Longer Path, S&P Yield Curves Flatten',
    source: 'Wall Street Journal',
    time: '1h ago',
    summary: 'The Federal Reserve notes high inflation pressures might necessitate high interest rates for an extended period, weighing down indices.',
    sentiment: 'negative',
    symbol: 'SPY',
    impactPercent: -0.85,
  },
  {
    id: 'n3',
    title: 'Apple Explores Generative AI Partnership with Core Search Engines for iOS Integration',
    source: 'TechCrunch',
    time: '2h ago',
    summary: 'Report suggests Apple is in deep talks to integrate powerful cloud AI models directly into the upcoming iPhone operating system.',
    sentiment: 'positive',
    symbol: 'AAPL',
    impactPercent: 1.5,
  },
  {
    id: 'n4',
    title: 'Microsoft Azure Launches Custom Cloud Silicon Aimed at High-Density Training Sets',
    source: 'Reuters',
    time: '3h ago',
    summary: 'Microsoft rolls out Cobalt CPUs and Maia AI accelerators across critical Azure regions to reduce dependency on sole chip vendors.',
    sentiment: 'positive',
    symbol: 'MSFT',
    impactPercent: 1.2,
  },
  {
    id: 'n5',
    title: 'Tesla Facing Supply Bottlenecks in Gigafactory Berlin Following Power Outages',
    source: 'CNBC',
    time: '4h ago',
    summary: 'Tesla confirms delivery guidance might be slightly impacted due to local infrastructure outages and environmental regulatory reviews.',
    sentiment: 'negative',
    symbol: 'TSLA',
    impactPercent: -2.4,
  },
  {
    id: 'n6',
    title: 'Bitcoin Nears Historical Resistance at $70,000 Amid Strong Spot ETF Inflows',
    source: 'CoinDesk',
    time: '6h ago',
    summary: 'Crypto assets lead high-beta options after institutional spot ETF providers record another consecutive week of net positive assets.',
    sentiment: 'positive',
    symbol: 'BTC-USD',
    impactPercent: 4.1,
  },
];

// Mock portfolio
let portfolioHoldings: PortfolioHolding[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', quantity: 15, avgBuyPrice: 175.2, currentPrice: 182.52, sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', quantity: 8, avgBuyPrice: 390.1, currentPrice: 415.5, sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', quantity: 5, avgBuyPrice: 650.0, currentPrice: 875.12, sector: 'Semiconductors' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', quantity: 12, avgBuyPrice: 195.4, currentPrice: 175.34, sector: 'Automotive' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', quantity: 0.15, avgBuyPrice: 58000.0, currentPrice: 67840.0, sector: 'Cryptocurrency' },
];

export function getPortfolioHoldings(): PortfolioHolding[] {
  return portfolioHoldings.map((h) => {
    const quote = getStockQuote(h.symbol);
    return {
      ...h,
      currentPrice: quote.price,
    };
  });
}

export function executeTrade(symbol: string, quantity: number, type: 'BUY' | 'SELL'): boolean {
  if (quantity <= 0) return false;
  const quote = getStockQuote(symbol);
  const holdings = [...portfolioHoldings];
  const index = holdings.findIndex((h) => h.symbol === symbol);

  if (type === 'BUY') {
    if (index >= 0) {
      const h = holdings[index];
      const newQty = h.quantity + quantity;
      const newAvg = (h.quantity * h.avgBuyPrice + quantity * quote.price) / newQty;
      holdings[index] = {
        ...h,
        quantity: newQty,
        avgBuyPrice: Number(newAvg.toFixed(2)),
        currentPrice: quote.price,
      };
    } else {
      holdings.push({
        symbol,
        name: quote.name,
        quantity,
        avgBuyPrice: quote.price,
        currentPrice: quote.price,
        sector: symbol === 'BTC-USD' ? 'Cryptocurrency' : symbol === 'NVDA' ? 'Semiconductors' : 'Technology',
      });
    }
    portfolioHoldings = holdings;
    return true;
  } else {
    // Sell
    if (index < 0 || holdings[index].quantity < quantity) {
      return false; // insufficient holdings
    }
    const h = holdings[index];
    const newQty = h.quantity - quantity;
    if (newQty === 0) {
      holdings.splice(index, 1);
    } else {
      holdings[index] = {
        ...h,
        quantity: newQty,
        currentPrice: quote.price,
      };
    }
    portfolioHoldings = holdings;
    return true;
  }
}
