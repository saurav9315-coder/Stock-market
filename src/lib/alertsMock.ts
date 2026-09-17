export interface Alert {
  id: string;
  symbol: string;
  type: string; // 'Price Above' | 'Price Below' | 'RSI' | 'Volume Spike' etc.
  condition: string; // 'Above 190.00' | 'RSI > 70' | 'Volume > 2.0x'
  currentValue: number;
  targetValue: number;
  status: 'active' | 'paused' | 'expired';
  createdAt: string;
  lastTriggered: string;
  frequency: 'Once' | 'Daily' | 'Weekly' | 'Repeating';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  category: 'price' | 'portfolio' | 'ai' | 'news' | 'system';
  symbol?: string;
}

export interface AiSmartAlert {
  id: string;
  title: string;
  description: string;
  type: 'volatility' | 'earnings' | 'insider' | 'momentum';
  confidence: number; // percentage
  suggestedAction: string;
}

export interface AlertTemplate {
  name: string;
  strategy: string; // 'Day Trading' | 'Swing Trading' etc.
  description: string;
  alerts: Omit<Alert, 'id' | 'createdAt' | 'lastTriggered' | 'currentValue'>[];
}

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "alert-1",
    symbol: "AAPL",
    type: "Price Above",
    condition: "Price Above 185.00",
    currentValue: 182.52,
    targetValue: 185.00,
    status: "active",
    createdAt: "2026-07-10 10:00",
    lastTriggered: "2026-07-12 14:35",
    frequency: "Repeating"
  },
  {
    id: "alert-2",
    symbol: "MSFT",
    type: "Price Below",
    condition: "Price Below 410.00",
    currentValue: 415.50,
    targetValue: 410.00,
    status: "active",
    createdAt: "2026-07-11 09:15",
    lastTriggered: "Never",
    frequency: "Once"
  },
  {
    id: "alert-3",
    symbol: "NVDA",
    type: "RSI",
    condition: "RSI > 75",
    currentValue: 71.4,
    targetValue: 75.0,
    status: "active",
    createdAt: "2026-07-13 11:30",
    lastTriggered: "2026-07-14 16:12",
    frequency: "Repeating"
  },
  {
    id: "alert-4",
    symbol: "TSLA",
    type: "Volume Spike",
    condition: "Volume > 2.5x Avg",
    currentValue: 1.2,
    targetValue: 2.5,
    status: "active",
    createdAt: "2026-07-14 09:30",
    lastTriggered: "Never",
    frequency: "Repeating"
  },
  {
    id: "alert-5",
    symbol: "BTC-USD",
    type: "Price Above",
    condition: "Price Above 70000.00",
    currentValue: 67840.00,
    targetValue: 70000.00,
    status: "paused",
    createdAt: "2026-07-08 15:45",
    lastTriggered: "2026-07-09 22:15",
    frequency: "Repeating"
  },
  {
    id: "alert-6",
    symbol: "GOOGL",
    type: "EMA Cross",
    condition: "EMA 20 Crosses Up EMA 50",
    currentValue: 168.20,
    targetValue: 170.00,
    status: "expired",
    createdAt: "2026-07-05 10:20",
    lastTriggered: "2026-07-07 10:05",
    frequency: "Once"
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Price Alert Triggered: AAPL",
    description: "Apple Inc. crossed above target value 182.00 (Current: 182.52)",
    time: "10 mins ago",
    priority: "medium",
    read: false,
    category: "price",
    symbol: "AAPL"
  },
  {
    id: "notif-2",
    title: "AI Risk Alert: High Volatility Warning",
    description: "NVIDIA Corp (NVDA) options volume indicates potential 4.5% volatility expansion in opening sessions.",
    time: "45 mins ago",
    priority: "high",
    read: false,
    category: "ai",
    symbol: "NVDA"
  },
  {
    id: "notif-3",
    title: "Portfolio Gain Alert: Tech Basket",
    description: "Your tech-focused portfolio basket has risen by 3.45% in today's active trading window.",
    time: "2 hours ago",
    priority: "medium",
    read: true,
    category: "portfolio"
  },
  {
    id: "notif-4",
    title: "Corporate Action: Dividend Announcement",
    description: "Microsoft Corp (MSFT) declared quarterly dividend of $0.75 per share, ex-date Jul 20.",
    time: "4 hours ago",
    priority: "low",
    read: true,
    category: "system",
    symbol: "MSFT"
  },
  {
    id: "notif-5",
    title: "System Notification: Data Synced",
    description: "Sandbox market feeds successfully synchronized with global institutional exchanges.",
    time: "6 hours ago",
    priority: "low",
    read: true,
    category: "system"
  }
];

export const MOCK_AI_SMART_ALERTS: AiSmartAlert[] = [
  {
    id: "smart-1",
    title: "High Volatility Warning: TSLA",
    description: "Imminent price breakout warning as daily trading range contracts below 30-day Bollinger Band averages.",
    type: "volatility",
    confidence: 88,
    suggestedAction: "Monitor 170.00 support floor"
  },
  {
    id: "smart-2",
    title: "Bullish Pattern Detected: AAPL",
    description: "Double bottom breakout pattern forming on 4-hour candlesticks, backed by rising relative strength indicators.",
    type: "momentum",
    confidence: 76,
    suggestedAction: "Enter bullish long positions above 183.50"
  },
  {
    id: "smart-3",
    title: "Unusual Volume Spike: NVDA",
    description: "Dark pool call option volumes show block trade buy-in rates exceeding 250% average monthly sizes.",
    type: "insider",
    confidence: 92,
    suggestedAction: "Rebalance semiconductor portfolios"
  },
  {
    id: "smart-4",
    title: "Earnings Opportunity: MSFT",
    description: "Historical stats indicate Q2 earnings beat probabilities exceed 82% over the last 12 quarterly reviews.",
    type: "earnings",
    confidence: 85,
    suggestedAction: "Configure pre-earnings straddle options"
  }
];

export const MOCK_TEMPLATES: AlertTemplate[] = [
  {
    name: "Day Trading Strategy",
    strategy: "Day Trading",
    description: "Rapid technical breakout triggers for momentum tracking.",
    alerts: [
      { symbol: "AAPL", type: "RSI", condition: "RSI < 30 (Oversold)", targetValue: 30, status: "active", frequency: "Repeating" },
      { symbol: "NVDA", type: "RSI", condition: "RSI > 70 (Overbought)", targetValue: 70, status: "active", frequency: "Repeating" },
      { symbol: "QQQ", type: "Volume Spike", condition: "Volume > 2.0x Avg", targetValue: 2.0, status: "active", frequency: "Repeating" }
    ]
  },
  {
    name: "Swing Trading Strategy",
    strategy: "Swing Trading",
    description: "Support and resistance triggers based on weekly moving averages.",
    alerts: [
      { symbol: "MSFT", type: "SMA Cross", condition: "SMA 20 Crosses SMA 100", targetValue: 420.00, status: "active", frequency: "Repeating" },
      { symbol: "TSLA", type: "Price Below", condition: "Price Below 165.00 Support", targetValue: 165.00, status: "active", frequency: "Repeating" }
    ]
  },
  {
    name: "Long-Term Investing",
    strategy: "Long-Term Investing",
    description: "Favorable entries based on dividend ex-dates and price pullbacks.",
    alerts: [
      { symbol: "AAPL", type: "Price Below", condition: "Price Below 170.00", targetValue: 170.00, status: "active", frequency: "Repeating" },
      { symbol: "GOOGL", type: "Price Below", condition: "Price Below 150.00", targetValue: 150.00, status: "active", frequency: "Repeating" }
    ]
  }
];

export function generateLiveNotification(index: number): NotificationItem {
  const alerts = [
    { title: "Price Trigger: TSLA Above 180.00", desc: "Tesla Inc. (TSLA) rallied above 180.00 target benchmark (Current: 180.25).", sym: "TSLA", cat: "price" as const },
    { title: "Volume Alert: GOOGL", desc: "Alphabet Inc. (GOOGL) recorded a 3.1x volume spike in midday block option volumes.", sym: "GOOGL", cat: "price" as const },
    { title: "AI Quant Buy Signal: NVDA", desc: "AI models detected bullish MACD crossovers on the 1-hour chart, suggesting momentum continuation.", sym: "NVDA", cat: "ai" as const },
    { title: "News Sentiment Shift: AAPL", desc: "Apple sentiment turned heavily bullish (+12% shift) following news of supply partnerships.", sym: "AAPL", cat: "news" as const },
    { title: "Portfolio Drop Watch: Tech Basket", desc: "Your portfolio holding TSLA fell below $170, triggering a trailing stop loss warning.", sym: "TSLA", cat: "portfolio" as const }
  ];

  const picked = alerts[index % alerts.length];

  return {
    id: `live-notif-${Date.now()}-${index}`,
    title: picked.title,
    description: picked.desc,
    time: "Just now",
    priority: index % 3 === 0 ? "high" : "medium",
    read: false,
    category: picked.cat,
    symbol: picked.sym
  };
}
