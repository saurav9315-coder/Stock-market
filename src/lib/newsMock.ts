export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  author: string;
  category: string;
  publishedTime: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relatedStocks: string[];
  coverImage: string; // CSS gradient specs or placeholder strings
  viewsCount: number;
  trendingScore: number;
  readTime: string;
}

export interface LiveFlashNews {
  id: string;
  title: string;
  source: string;
  time: string;
  symbol?: string;
  companyLogo?: string;
  impactPercent?: number;
  isBreaking?: boolean;
  marketImpact?: 'high' | 'medium' | 'low';
}

export interface EconomicEvent {
  id: string;
  time: string;
  title: string;
  country: string;
  importance: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: "art-1",
    title: "NVIDIA Unveils Blackwell B200 GPU: Accelerating the Next Industrial Revolution",
    summary: "At its flagship developer summit, NVIDIA announced its most powerful AI architectures yet. The Blackwell B200 chip offers 20 petaflops of FP4 power, drastically reducing AI training model costs and carbon footprint.",
    content: "NVIDIA CEO Jensen Huang took the stage to announce the Blackwell GPU architecture, which delivers 30x performance gains for LLM workloads. Key cloud infrastructure vendors including Microsoft Azure, Google Cloud, and Amazon Web Services have already committed to massive deployments. Wall Street analysts reacted with widespread upgrades, raising NVDA price targets as AI demand shows no signs of peak saturation. The announcement sent shockwaves through competitors and bolstered high-beta semiconductors.",
    source: "Bloomberg Technology",
    author: "Elena Rostova",
    category: "AI",
    publishedTime: "12 mins ago",
    sentiment: "bullish",
    relatedStocks: ["NVDA", "MSFT", "GOOGL"],
    coverImage: "linear-gradient(135deg, oklch(0.2 0.05 140), oklch(0.1 0.02 240))",
    viewsCount: 15420,
    trendingScore: 98,
    readTime: "4 min read"
  },
  {
    id: "art-2",
    title: "Federal Reserve Holds Interest Rates Steady, Hints at Delayed Cuts Amid Sticky CPI Data",
    summary: "The Federal Open Market Committee (FOMC) maintained the federal funds rate at 5.25%-5.50%. Powell signaled inflation remains too sticky, reducing expectations of near-term rate adjustments.",
    content: "The Fed's policy statement highlighted solid economic activity and slow progress toward their 2% target. Chair Jerome Powell cautioned that cuts require greater confidence that inflation is moving sustainably downward. Markets reacted negatively, with the S&P 500 erasing intraday gains and treasury yields pushing higher. Bond traders are now pricing in a maximum of two rate cuts this calendar year, reflecting a higher-for-longer regime.",
    source: "Wall Street Journal",
    author: "Marcus Vance",
    category: "Economy",
    publishedTime: "45 mins ago",
    sentiment: "bearish",
    relatedStocks: ["SPY", "QQQ", "TLT"],
    coverImage: "linear-gradient(135deg, oklch(0.2 0.05 28), oklch(0.1 0.02 240))",
    viewsCount: 12450,
    trendingScore: 95,
    readTime: "6 min read"
  },
  {
    id: "art-3",
    title: "Apple Pursues Multi-Billion Dollar Gemini AI Integration Deal for iOS Platforms",
    summary: "Reports suggest Apple is in advanced negotiations to license Google's Gemini generative AI engine for Upcoming iOS features, representing a monumental cloud partnership.",
    content: "Apple plans to introduce a suite of localized and cloud-based AI features at WWDC. The deal with Google would power advanced language generation, media processing, and smarter Siri requests. Investors applauded the partnership, viewing it as a rapid shortcut for Apple to catch up in the generative AI race, while Google gains distribution access to over 1 billion active iPhone nodes globally.",
    source: "CNBC Pro",
    author: "Sarah Jenkins",
    category: "Technology",
    publishedTime: "2 hours ago",
    sentiment: "bullish",
    relatedStocks: ["AAPL", "GOOGL"],
    coverImage: "linear-gradient(135deg, oklch(0.25 0.05 200), oklch(0.1 0.02 240))",
    viewsCount: 9800,
    trendingScore: 92,
    readTime: "3 min read"
  },
  {
    id: "art-4",
    title: "RBI Keeps Repo Rate Unchanged at 6.50% to Ensure Inflation Anchoring",
    summary: "The Reserve Bank of India MPC voted to keep the repo rate at 6.5%, retaining its stance of withdrawal of accommodation. Governor Das highlighted robust GDP projections.",
    content: "India's real GDP growth for the upcoming fiscal is projected at 7.0%, backed by strong consumption and public investment. However, volatile food inflation continues to present risk factors. The MPC retains focus on aligning CPI inflation to the 4% target on a durable basis. Banking shares traded stable following the announcement.",
    source: "Reuters India",
    author: "Amit Sharma",
    category: "Economy",
    publishedTime: "3 hours ago",
    sentiment: "neutral",
    relatedStocks: ["HDFCBANK", "RELIANCE", "NIFTY_50"],
    coverImage: "linear-gradient(135deg, oklch(0.2 0.02 240), oklch(0.1 0.01 240))",
    viewsCount: 7200,
    trendingScore: 84,
    readTime: "5 min read"
  },
  {
    id: "art-5",
    title: "Tesla Q1 Earnings Miss: Operating Margin Contracts to 5.5% as Price War Escalates",
    summary: "Tesla reported earnings per share of $0.45 vs. $0.50 expected, as automotive revenue margins continue to feel pressure from global EV discounts and soft deliveries.",
    content: "Tesla delivered 386,810 vehicles, representing a decline year-over-year. The company cited supply chain disruptions at Gigafactory Berlin and production ramp issues of the Cybertruck. CEO Elon Musk reassured shareholders that full self-driving licensing contracts and next-gen low-cost platform development remain top long-term catalysts, but near-term headwinds remain prominent.",
    source: "Bloomberg Markets",
    author: "Charles Lin",
    category: "Earnings",
    publishedTime: "5 hours ago",
    sentiment: "bearish",
    relatedStocks: ["TSLA"],
    coverImage: "linear-gradient(135deg, oklch(0.2 0.06 20), oklch(0.1 0.02 240))",
    viewsCount: 14100,
    trendingScore: 90,
    readTime: "8 min read"
  },
  {
    id: "art-6",
    title: "Starlink India IPO Rumors Swirl After Satellite License Clears Key Security Hurdle",
    summary: "Speculation rises that Starlink will list its Indian subsidiary as regulatory reports indicate approval for satellite gateway operations is near completion.",
    content: "The Department of Telecommunications is reviewing Starlink's proposal for global mobile personal communication satellite services. A potential listing in local markets could raise over $1.5 billion, valuing the Indian gateway franchise at an enterprise level. Telecom competitors are monitoring developments closely.",
    source: "Economic Times",
    author: "Rohan Sen",
    category: "IPO",
    publishedTime: "6 hours ago",
    sentiment: "bullish",
    relatedStocks: ["RELIANCE", "BHARTIARTL"],
    coverImage: "linear-gradient(135deg, oklch(0.25 0.06 142), oklch(0.1 0.02 240))",
    viewsCount: 6540,
    trendingScore: 78,
    readTime: "4 min read"
  },
  {
    id: "art-7",
    title: "Ethereum Spot ETFs Draw Over $500M in Net Inflows in Opening Trading Sessions",
    summary: "Institutional appetite for spot crypto assets surges as newly approved spot Ethereum ETFs record heavy trading volumes, replicating Bitcoin's previous launch success.",
    content: "Regulatory updates enabled multiple issuers (BlackRock, Fidelity, Grayscale) to commence trading of spot Ethereum funds. Markets responded with net long crypto derivative positions, though spot ETH prices trade slightly sideways as early conversions of Grayscale Trust offset net inflows. Analysts expect supply dynamics to turn deflationary in late quarters.",
    source: "CoinDesk",
    author: "Danny Nelson",
    category: "Crypto",
    publishedTime: "8 hours ago",
    sentiment: "bullish",
    relatedStocks: ["ETH-USD", "COIN", "BTC-USD"],
    coverImage: "linear-gradient(135deg, oklch(0.2 0.05 240), oklch(0.1 0.03 280))",
    viewsCount: 8800,
    trendingScore: 88,
    readTime: "5 min read"
  },
  {
    id: "art-8",
    title: "Gold Hits Record $2,450/oz on Central Bank Purchases and Geopolitical Flight to Safety",
    summary: "Spot gold surged to all-time highs as macroeconomic uncertainty, treasury yield fluctuations, and aggressive buying from global central banks supported defensive hedges.",
    content: "Commodity funds are expanding long positioning in physical precious metals. Analysts highlight that monetary policy diversification and structural hedging will sustain gold pricing support. Spot silver and platinum also marked substantial relative weekly gains.",
    source: "Reuters Commodities",
    author: "James Peterson",
    category: "Commodities",
    publishedTime: "12 hours ago",
    sentiment: "bullish",
    relatedStocks: ["GLD", "SLV"],
    coverImage: "linear-gradient(135deg, oklch(0.22 0.06 70), oklch(0.1 0.02 240))",
    viewsCount: 5200,
    trendingScore: 70,
    readTime: "3 min read"
  },
  {
    id: "art-9",
    title: "Vanguard Tech ETF (VGT) Rebalances Portfolio: Raising Weighting of Chip Manufacturers",
    summary: "The passive fund index announced major allocation adjustments, dramatically scaling up chip makers relative to software publishers based on market capitalizations.",
    content: "VGT, one of the largest technology ETFs, has boosted its weighting in NVIDIA and Broadcom while paring back minor positions in legacy software developers. Rebalancing results will drive massive net institutional buying vectors in the coming days, stabilizing chip sectors.",
    source: "Morningstar",
    author: "Sarah Davis",
    category: "ETFs",
    publishedTime: "1 day ago",
    sentiment: "neutral",
    relatedStocks: ["NVDA", "AVGO", "MSFT"],
    coverImage: "linear-gradient(135deg, oklch(0.2 0.01 240), oklch(0.1 0.01 240))",
    viewsCount: 4600,
    trendingScore: 65,
    readTime: "4 min read"
  }
];

export const MOCK_LIVE_FLASH_NEWS: LiveFlashNews[] = [
  {
    id: "flash-1",
    title: "Apple Inc. (AAPL) secures custom display supply deal with Samsung for advanced OLED panels.",
    source: "CNBC Feed",
    time: "2 mins ago",
    symbol: "AAPL",
    impactPercent: 0.85,
    isBreaking: false,
    marketImpact: "low"
  },
  {
    id: "flash-2",
    title: "BREAKING: US Core CPI inflation increases by 0.3% in June, higher than the 0.2% consensus forecast.",
    source: "Reuters Terminal",
    time: "4 mins ago",
    symbol: "SPY",
    impactPercent: -1.2,
    isBreaking: true,
    marketImpact: "high"
  },
  {
    id: "flash-3",
    title: "NVIDIA Corp. (NVDA) starts shipping HGX Blackwell systems to premium hyperscalers.",
    source: "Bloomberg Stream",
    time: "8 mins ago",
    symbol: "NVDA",
    impactPercent: 2.1,
    isBreaking: false,
    marketImpact: "medium"
  },
  {
    id: "flash-4",
    title: "Microsoft (MSFT) collaborates with OpenAI on $100 Billion 'Stargate' AI Supercomputer project.",
    source: "Wall Street Journal",
    time: "15 mins ago",
    symbol: "MSFT",
    impactPercent: 1.45,
    isBreaking: false,
    marketImpact: "medium"
  },
  {
    id: "flash-5",
    title: "BREAKING: Tesla (TSLA) halts production at Shanghai Gigafactory due to upgrade modifications.",
    source: "Reuters Terminal",
    time: "22 mins ago",
    symbol: "TSLA",
    impactPercent: -3.1,
    isBreaking: true,
    marketImpact: "high"
  },
  {
    id: "flash-6",
    title: "HDFC Bank Ltd. reports Q4 deposits growth of 26% YoY, exceeding street estimates.",
    source: "Economic Times",
    time: "30 mins ago",
    symbol: "HDFCBANK",
    impactPercent: 1.8,
    isBreaking: false,
    marketImpact: "medium"
  }
];

export const MOCK_ECONOMIC_EVENTS: EconomicEvent[] = [
  {
    id: "event-1",
    time: "18:00",
    title: "US Federal Funds Rate Decision",
    country: "USA",
    importance: "high",
    actual: "5.50%",
    forecast: "5.50%",
    previous: "5.50%"
  },
  {
    id: "event-2",
    time: "11:30",
    title: "RBI Interest Rate Decision",
    country: "IND",
    importance: "high",
    actual: "6.50%",
    forecast: "6.50%",
    previous: "6.50%"
  },
  {
    id: "event-3",
    time: "18:00",
    title: "US Core CPI Inflation (YoY)",
    country: "USA",
    importance: "high",
    actual: "3.4%",
    forecast: "3.2%",
    previous: "3.3%"
  },
  {
    id: "event-4",
    time: "12:00",
    title: "India WPI Inflation (YoY)",
    country: "IND",
    importance: "medium",
    actual: "2.61%",
    forecast: "2.40%",
    previous: "2.33%"
  },
  {
    id: "event-5",
    time: "19:00",
    title: "US Initial Jobless Claims",
    country: "USA",
    importance: "medium",
    actual: "220K",
    forecast: "215K",
    previous: "218K"
  },
  {
    id: "event-6",
    time: "15:30",
    title: "Eurozone GDP (QoQ) Final",
    country: "EUR",
    importance: "medium",
    actual: "0.3%",
    forecast: "0.3%",
    previous: "0.1%"
  }
];

// Helper database of companies for logos and quick stats
export const COMPANY_PROFILES: Record<string, { name: string; sector: string; logoText: string; color: string }> = {
  AAPL: { name: "Apple Inc.", sector: "Consumer Electronics", logoText: "", color: "from-gray-600 to-gray-800" },
  MSFT: { name: "Microsoft Corporation", sector: "Infrastructure Software", logoText: "⊞", color: "from-blue-600 to-indigo-700" },
  NVDA: { name: "NVIDIA Corporation", sector: "Semiconductors", logoText: "🖳", color: "from-green-600 to-emerald-700" },
  GOOGL: { name: "Alphabet Inc.", sector: "Internet Content", logoText: "G", color: "from-red-500 via-yellow-500 to-blue-500" },
  TSLA: { name: "Tesla Inc.", sector: "Automotive", logoText: "T", color: "from-rose-600 to-red-700" },
  HDFCBANK: { name: "HDFC Bank Ltd.", sector: "Commercial Banks", logoText: "H", color: "from-blue-700 to-cyan-800" },
  RELIANCE: { name: "Reliance Industries", sector: "Oil, Gas & Retail", logoText: "R", color: "from-sky-700 to-indigo-800" },
  BHARTIARTL: { name: "Bharti Airtel Ltd.", sector: "Telecom", logoText: "A", color: "from-orange-600 to-red-600" },
  SPY: { name: "SPDR S&P 500 ETF", sector: "Market Indices", logoText: "S&P", color: "from-indigo-600 to-purple-800" }
};

// Generates a simulated dynamic news update
export function generateNextLiveNews(index: number): LiveFlashNews {
  const titles = [
    "Alphabet Inc. (GOOGL) expands AI medical diagnostics trial with major healthcare providers.",
    "Federal Reserve Bank of New York President highlights resilient jobs data supports patient rates policy.",
    "NVIDIA (NVDA) receives structural buy ratings from top tier quantitative desks, raising target to $1,100.",
    "India Passenger Vehicle Sales report 8% sequential gains, showing premium EV adoption acceleration.",
    "Goldman Sachs raises S&P 500 year-end targets citing enterprise productivity enhancements via AI models.",
    "Tesla (TSLA) secures regulatory permissions for Full Self-Driving beta testing trials in Shanghai.",
    "Crypto liquidations top $150 Million as Bitcoin climbs above intraday resistance benchmarks."
  ];
  const symbols = ["GOOGL", "SPY", "NVDA", "RELIANCE", "SPY", "TSLA", "BTC-USD"];
  const impacts = [1.2, -0.2, 2.8, 1.5, 0.9, 4.2, 3.5];
  const sources = ["Reuters Terminal", "Bloomberg Stream", "WSJ Wire", "Economic Times", "Bloomberg Technology", "CNBC Feed", "CoinDesk"];
  
  const pickedIdx = index % titles.length;

  return {
    id: `dynamic-${Date.now()}-${pickedIdx}`,
    title: titles[pickedIdx],
    source: sources[pickedIdx],
    time: "Just now",
    symbol: symbols[pickedIdx],
    impactPercent: impacts[pickedIdx],
    isBreaking: impacts[pickedIdx] > 2.0 || impacts[pickedIdx] < -1.0,
    marketImpact: Math.abs(impacts[pickedIdx]) > 2.0 ? "high" : "medium"
  };
}
