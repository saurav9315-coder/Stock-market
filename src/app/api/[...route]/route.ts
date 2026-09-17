import { NextRequest, NextResponse } from 'next/server';
import { getStockQuote, getChartData, getAllQuotes } from '@/lib/stockMock';

// In-Memory Database persistence for the BFF
let sessionWatchlists = [
  { id: 'favs', name: 'My Favorites', color: 'bg-rose-500', symbols: ['AAPL', 'MSFT', 'NVDA', 'SPY'] },
  { id: 'long', name: 'Long Term', color: 'bg-emerald-500', symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'JNJ', 'JPM'] },
  { id: 'swing', name: 'Swing Trades', color: 'bg-blue-500', symbols: ['TSLA', 'COIN', 'GME'] },
  { id: 'divs', name: 'Dividend Stocks', color: 'bg-purple-500', symbols: ['JPM', 'JNJ', 'AAPL', 'MSFT', 'SPY'] },
  { id: 'tech', name: 'Technology', color: 'bg-indigo-500', symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL'] },
];

let walletCash = 25000.00;
const walletInvested = 32800.00;
let userHoldings = [
  { symbol: 'AAPL', name: 'Apple Inc.', shares: 15, avgBuyPrice: 175.20, currentPrice: 182.52, marketValue: 2737.80, gainLoss: 109.80, gainLossPercent: 4.18, allocation: 8.3 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 20, avgBuyPrice: 405.00, currentPrice: 415.50, marketValue: 8310.00, gainLoss: 210.00, gainLossPercent: 2.59, allocation: 25.3 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 25, avgBuyPrice: 850.00, currentPrice: 875.12, marketValue: 21878.00, gainLoss: 628.00, gainLossPercent: 2.95, allocation: 66.4 },
];

const transactionHistory = [
  { id: 'TXN-902341', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Deposit', amount: 15000.00, method: 'Bank Transfer', status: 'Completed', note: 'Initial sandbox capitalization' },
  { id: 'TXN-902342', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Buy Stock', amount: 2628.00, method: 'Wallet', status: 'Completed', note: 'Purchased 15 AAPL shares' },
];

let alerts = [
  { id: 'al-1', symbol: 'AAPL', type: 'GREATER_THAN', targetValue: 190.00, isActive: true },
  { id: 'al-2', symbol: 'TSLA', type: 'LESS_THAN', targetValue: 160.00, isActive: true },
];

const smartAlerts = [
  { id: 'sa-1', title: 'Breakout Momentum Alert', symbol: 'NVDA', type: 'HIGH_BETA', message: 'NVIDIA Corp. exhibits volume spike +42% over moving average floors.' },
  { id: 'sa-2', title: 'RSI Overbought Correction Alert', symbol: 'AAPL', type: 'MACD_CROSSOVER', message: 'AAPL hourly charts indicate divergence indicators crossing signal triggers.' },
];

const chatMessages = [
  { id: 'msg-1', role: 'assistant', content: 'Quant Terminal initialized. I have reviewed your portfolio asset spreads. AAPL, MSFT, and NVDA compose 100% of your holdings. Ready to model allocations.', timestamp: new Date(Date.now() - 3600000).toISOString() },
];

// Authenticated User Identity Model
interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

// In-memory token-to-user store for verified session tokens
function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  if (token === 'jwt_admin_token_secret_789') {
    return {
      id: 'usr_admin_001',
      name: 'QUANT EXECUTIVE ADMIN',
      email: 'admin@quant.com',
      role: 'ADMIN',
    };
  }
  if (token === 'jwt_access_mock_token_secret_123') {
    return {
      id: 'usr_8923a',
      name: 'ALEX MERCER',
      email: 'sandbox@quant.com',
      role: 'USER',
    };
  }
  return null;
}

// Authentication check (protect)
function verifyAuth(request: NextRequest): boolean {
  return getAuthenticatedUser(request) !== null;
}

// Role Authorization check (adminOnly)
function requireAdmin(request: NextRequest): { authorized: boolean; response?: NextResponse } {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Authentication required. 401 Unauthorized.' },
        { status: 401 }
      ),
    };
  }
  if (user.role !== 'ADMIN') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      ),
    };
  }
  return { authorized: true };
}

// Router dynamic segments resolver
export async function GET(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');
  
  // Public/Guest actions
  if (path === 'market/indices') {
    return NextResponse.json([
      { symbol: 'SPY', name: 'S&P 500 ETF', price: 512.44, change: 4.88, changePercent: 0.96 },
      { symbol: 'QQQ', name: 'NASDAQ 100', price: 438.60, change: 6.22, changePercent: 1.44 },
      { symbol: 'DIA', name: 'Dow Jones Index', price: 390.12, change: -1.02, changePercent: -0.26 },
    ]);
  }

  if (path === 'market/sectors') {
    return NextResponse.json([
      { name: 'Technology', change: 2.14, volume: '48.2M' },
      { name: 'Financials', change: 0.88, volume: '22.1M' },
      { name: 'Healthcare', change: -0.42, volume: '18.9M' },
      { name: 'Energy', change: -1.12, volume: '14.5M' },
      { name: 'Consumer Cyclical', change: 1.34, volume: '29.3M' },
    ]);
  }

  if (path === 'news/latest') {
    return NextResponse.json([
      { id: 'news-1', title: 'Fed Signals Neutral Rate Holds in Macro Yield Allocations', source: 'Quant Financial Network', time: '10 mins ago', category: 'Macroeconomics' },
      { id: 'news-2', title: 'Tech Giants Unveil Sub-10ms High Frequency Execution Nodes', source: 'Institutional Broker Intel', time: '35 mins ago', category: 'Tech Operations' },
    ]);
  }

  if (path === 'news/trending') {
    return NextResponse.json([
      { id: 'news-3', title: 'NVIDIA Options Volume Skews Call Heavy Amid Breakout Projections', source: 'Derivatives Weekly', time: '1 hour ago', category: 'Derivatives' },
    ]);
  }

  if (path.startsWith('news/company/')) {
    const symbol = route[2];
    return NextResponse.json([
      { id: `news-${symbol}-1`, title: `${symbol} Outlines Strategic Quantitative Re-balancing Milestones`, source: 'Capital Wire', time: '4 hours ago', category: 'Corporate Strategy' },
    ]);
  }

  if (path === 'stocks') {
    return NextResponse.json(getAllQuotes());
  }

  if (path.startsWith('stocks/') && path.endsWith('/historical')) {
    const symbol = route[1];
    const range = request.nextUrl.searchParams.get('range') || '1M';
    const rawData = getChartData(symbol, range);
    // Add dummy indicators
    const fullData = rawData.map((d, index) => {
      const rsi = 40 + Math.sin(index * 0.3) * 20;
      const macd = Math.sin(index * 0.2) * 1.5;
      return {
        ...d,
        rsi: Math.max(10, Math.min(90, rsi)),
        macd,
        macdSignal: macd * 0.9,
        macdHist: macd * 0.1,
      };
    });
    return NextResponse.json(fullData);
  }

  if (path.startsWith('stocks/')) {
    const symbol = route[1];
    const quote = getStockQuote(symbol);
    if (!quote) {
      return NextResponse.json({ message: 'Stock asset symbol not listed.' }, { status: 404 });
    }
    return NextResponse.json(quote);
  }

  // Auth verification for all remaining private endpoints
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: 'Access credential validation failed. 401 Unauthorized.' }, { status: 401 });
  }

  // Private endpoints
  if (path === 'users/profile') {
    return NextResponse.json({
      id: 'usr_8923a',
      name: 'ALEX MERCER',
      email: 'sandbox@quant.com',
      role: 'QUANT TRADER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150',
    });
  }

  if (path === 'watchlist') {
    return NextResponse.json(sessionWatchlists);
  }

  if (path === 'portfolio/summary') {
    const invested = userHoldings.reduce((sum, h) => sum + h.marketValue, 0);
    return NextResponse.json({
      totalValue: walletCash + invested,
      cashBalance: walletCash,
      investedValue: invested,
      totalGain: invested - userHoldings.reduce((sum, h) => sum + (h.shares * h.avgBuyPrice), 0),
      totalGainPercent: 3.84,
    });
  }

  if (path === 'portfolio/holdings') {
    return NextResponse.json(userHoldings);
  }

  if (path === 'portfolio/performance') {
    return NextResponse.json([
      { date: 'Mon', Equity: 55000, Benchmark: 54000 },
      { date: 'Tue', Equity: 56200, Benchmark: 54200 },
      { date: 'Wed', Equity: 55800, Benchmark: 54900 },
      { date: 'Thu', Equity: 57400, Benchmark: 55100 },
      { date: 'Fri', Equity: walletCash + userHoldings.reduce((sum, h) => sum + h.marketValue, 0), Benchmark: 55500 },
    ]);
  }

  if (path === 'portfolio/transactions') {
    return NextResponse.json(transactionHistory);
  }

  if (path === 'portfolio/analytics') {
    return NextResponse.json({
      sharpeRatio: 2.14,
      sortinoRatio: 2.88,
      betaCoeff: 1.05,
      alphaCoeff: 0.12,
      maxDrawdown: -8.4,
    });
  }

  if (path === 'wallet/balance') {
    return NextResponse.json({
      totalBalance: walletCash + userHoldings.reduce((sum, h) => sum + h.marketValue, 0),
      availableCash: walletCash,
      investedAmount: userHoldings.reduce((sum, h) => sum + h.marketValue, 0),
      todayPL: 480.00,
      todayPLPercent: 0.84,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
    });
  }

  if (path === 'wallet/transactions') {
    return NextResponse.json(transactionHistory);
  }

  if (path === 'security/settings') {
    return NextResponse.json({
      twoFactorEnabled: false,
      antiPhishingCode: 'QUANT_SIGNATURE_2026',
    });
  }

  if (path === 'security/sessions') {
    return NextResponse.json([
      { id: 'sess-1', device: 'MacBook Pro', location: 'New York, US', active: true, time: 'Current Session' },
    ]);
  }

  if (path === 'security/devices') {
    return NextResponse.json([
      { id: 'dev-1', name: 'Workplace PC', status: 'Authorized' },
    ]);
  }

  if (path === 'security/login-history') {
    return NextResponse.json([
      { date: new Date().toISOString(), status: 'Success', ip: '192.168.1.1' },
    ]);
  }

  if (path === 'alerts') {
    return NextResponse.json(alerts);
  }

  if (path === 'alerts/smart') {
    return NextResponse.json(smartAlerts);
  }

  if (path === 'ai/history') {
    return NextResponse.json(chatMessages);
  }

  // Admin routes - Strictly guarded by requireAdmin (adminOnly)
  if (path.startsWith('admin')) {
    const adminCheck = requireAdmin(request);
    if (!adminCheck.authorized) {
      return adminCheck.response!;
    }
  }

  if (path === 'admin/stats') {
    return NextResponse.json({
      totalUsers: 148,
      activeUsers: 84,
      pendingKyc: 3,
      totalDepositsVolume: 1250000.00,
      totalWithdrawalsVolume: 345000.00,
    });
  }

  if (path === 'admin/kyc') {
    return NextResponse.json([
      { id: 'kyc-1', userId: 'usr-92', name: 'Jane Doe', email: 'jane@doe.com', status: 'Pending', submissionDate: new Date().toISOString() },
    ]);
  }

  if (path === 'admin/deposits') {
    return NextResponse.json([
      { id: 'dep-1', userId: 'usr-92', amount: 5000, status: 'Pending', date: new Date().toISOString() },
    ]);
  }

  if (path === 'admin/withdrawals') {
    return NextResponse.json([
      { id: 'wth-1', userId: 'usr-92', amount: 1500, status: 'Pending', date: new Date().toISOString() },
    ]);
  }

  if (path === 'admin/tickets') {
    return NextResponse.json([
      { id: 'tkt-1', title: 'Withdrawal clear execution latency', user: 'Jane Doe', priority: 'High', status: 'Open' },
    ]);
  }

  if (path === 'admin/users') {
    return NextResponse.json([
      { id: 'usr-1', name: 'Jane Doe', email: 'jane@doe.com', role: 'USER', status: 'Active' },
      { id: 'usr-2', name: 'John Smith', email: 'john@smith.com', role: 'USER', status: 'Active' },
    ]);
  }

  return NextResponse.json({ message: 'Endpoint route not found' }, { status: 404 });
}

// POST operations
export async function POST(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');

  // Auth endpoints (Public)
  if (path === 'auth/login') {
    const body = await request.json();
    if (body.email === 'locked@quant.com') {
      return NextResponse.json({ message: 'Account locked due to excessive authentication failures.' }, { status: 403 });
    }
    if (body.email === '2fa@quant.com') {
      return NextResponse.json({ requires2fa: true });
    }
    if (body.password === 'Invalid123') {
      return NextResponse.json({ message: 'Invalid credentials. Please verify secrets.' }, { status: 422 });
    }

    const isAdmin = body.email?.toLowerCase().includes('admin') || body.email === 'admin@quant.com' || body.email === 'admin@stockinside.com';

    return NextResponse.json({
      accessToken: isAdmin ? 'jwt_admin_token_secret_789' : 'jwt_access_mock_token_secret_123',
      refreshToken: 'jwt_refresh_mock_token_secret_456',
      user: {
        id: isAdmin ? 'usr_admin_001' : 'usr_8923a',
        name: isAdmin ? 'ADMINISTRATOR' : (body.email.split('@')[0].toUpperCase() || 'TRADER'),
        email: body.email,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });
  }

  if (path === 'auth/register') {
    const body = await request.json();
    // Security Rule: Registrations MUST always become USER regardless of requested role
    return NextResponse.json({ 
      success: true,
      message: 'Registration codes dispatched to mailbox.',
      user: {
        id: `usr_${Date.now()}`,
        name: body.name || 'Trader',
        email: body.email,
        role: 'USER', // Always USER, ignore any client role tampering
      }
    });
  }

  if (path === 'auth/refresh') {
    const body = await request.json();
    if (body.refreshToken === 'jwt_refresh_mock_token_secret_456') {
      return NextResponse.json({
        accessToken: 'jwt_access_mock_token_secret_123',
        refreshToken: 'jwt_refresh_mock_token_secret_456',
      });
    }
    return NextResponse.json({ message: 'Refresh token signature validation failed.' }, { status: 401 });
  }

  if (path === 'auth/verify-email' || path === 'auth/verify-otp' || path === 'auth/verify-2fa') {
    const body = await request.json();
    if (body.code === '123456') {
      return NextResponse.json({
        accessToken: 'jwt_access_mock_token_secret_123',
        refreshToken: 'jwt_refresh_mock_token_secret_456',
        user: {
          id: 'usr_8923a',
          name: 'QUANT TRADER',
          email: 'sandbox@quant.com',
          role: 'QUANT TRADER',
        },
      });
    }
    return NextResponse.json({ message: 'Invalid verification token.' }, { status: 422 });
  }

  if (path === 'auth/forgot-password' || path === 'auth/reset-password') {
    return NextResponse.json({ success: true });
  }

  if (path === 'auth/logout') {
    return NextResponse.json({ success: true });
  }

  // Private routes authentication
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: '401 Unauthorized.' }, { status: 401 });
  }

  if (path === 'watchlist') {
    const body = await request.json();
    const newWl = {
      id: `wl-${Date.now()}`,
      name: body.name,
      color: body.color || 'bg-blue-500',
      symbols: [],
    };
    sessionWatchlists.push(newWl);
    return NextResponse.json(newWl);
  }

  if (path.startsWith('watchlist/') && path.endsWith('/stocks')) {
    const wlId = route[1];
    const body = await request.json();
    const wl = sessionWatchlists.find(w => w.id === wlId);
    if (wl) {
      if (!wl.symbols.includes(body.symbol)) {
        wl.symbols.push(body.symbol);
      }
      return NextResponse.json(wl);
    }
    return NextResponse.json({ message: 'Watchlist ledger not found.' }, { status: 404 });
  }

  if (path === 'orders') {
    const body = await request.json(); // symbol, type, quantity
    const quote = getStockQuote(body.symbol);
    if (!quote) {
      return NextResponse.json({ message: 'Security symbol not listed.' }, { status: 404 });
    }
    const cost = body.quantity * quote.price;
    if (body.type === 'BUY') {
      if (walletCash < cost) {
        return NextResponse.json({ message: 'Execution declined: Insufficient cash balance.' }, { status: 422 });
      }
      walletCash -= cost;
      const exist = userHoldings.find(h => h.symbol === body.symbol);
      if (exist) {
        exist.shares += body.quantity;
        exist.marketValue = exist.shares * quote.price;
      } else {
        userHoldings.push({
          symbol: body.symbol,
          name: quote.name,
          shares: body.quantity,
          avgBuyPrice: quote.price,
          currentPrice: quote.price,
          marketValue: cost,
          gainLoss: 0,
          gainLossPercent: 0,
          allocation: 10,
        });
      }
    } else {
      const exist = userHoldings.find(h => h.symbol === body.symbol);
      if (!exist || exist.shares < body.quantity) {
        return NextResponse.json({ message: 'Execution declined: Insufficient holding size.' }, { status: 422 });
      }
      walletCash += cost;
      exist.shares -= body.quantity;
      exist.marketValue = exist.shares * quote.price;
      if (exist.shares === 0) {
        userHoldings = userHoldings.filter(h => h.symbol !== body.symbol);
      }
    }
    transactionHistory.unshift({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      type: body.type === 'BUY' ? 'Buy Stock' : 'Sell Stock',
      amount: cost,
      method: 'Wallet',
      status: 'Completed',
      note: `${body.type === 'BUY' ? 'Bought' : 'Sold'} ${body.quantity} ${body.symbol} shares`,
    });
    return NextResponse.json({ message: 'Order executed at clearing terminal.' });
  }

  if (path === 'wallet/deposit') {
    const body = await request.json();
    walletCash += body.amount;
    transactionHistory.unshift({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      type: 'Deposit',
      amount: body.amount,
      method: body.method || 'Bank Transfer',
      status: 'Completed',
      note: 'Deposit clear clearance succeeded.',
    });
    return NextResponse.json({ success: true });
  }

  if (path === 'wallet/withdraw') {
    const body = await request.json();
    if (walletCash < body.amount) {
      return NextResponse.json({ message: 'Withdrawal declined: Insufficient cash balance.' }, { status: 422 });
    }
    walletCash -= body.amount;
    transactionHistory.unshift({
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      type: 'Withdrawal',
      amount: body.amount,
      method: body.method || 'Bank Transfer',
      status: 'Completed',
      note: 'Withdrawal process succeeded.',
    });
    return NextResponse.json({ success: true });
  }

  if (path === 'wallet/upload-proof') {
    return NextResponse.json({ success: true, fileUrl: 'https://proof.quant/rec-8820' });
  }

  if (path === 'ai/chat') {
    const body = await request.json();
    chatMessages.push({ id: `msg-${Date.now()}`, role: 'user', content: body.message, timestamp: new Date().toISOString() });
    
    // Simple response mapping
    let response = "Allocation model metrics analyzed. Risk parity balances look correct.";
    if (body.message.toLowerCase().includes('portfolio')) {
      response = `Reviewing holdings. You composition: ${userHoldings.map(h => `${h.symbol} (${h.shares} shares)`).join(', ')}. Sharpe ratio is estimated at 2.14.`;
    }
    const assistMsg = { id: `msg-${Date.now() + 1}`, role: 'assistant', content: response, timestamp: new Date().toISOString() };
    chatMessages.push(assistMsg);
    return NextResponse.json(assistMsg);
  }

  if (path === 'ai/analyze') {
    const body = await request.json();
    return NextResponse.json({
      summary: `AI Quantitative evaluation for ${body.symbol} signals strong accumulation floors.`,
      score: 84,
      sentiment: 'Bullish',
    });
  }

  if (path === 'alerts') {
    const body = await request.json();
    const newAlert = {
      id: `al-${Date.now()}`,
      symbol: body.symbol,
      type: body.type,
      targetValue: body.targetValue,
      isActive: true,
    };
    alerts.push(newAlert);
    return NextResponse.json(newAlert);
  }

  // Admin actions - Strictly guarded by requireAdmin (adminOnly)
  if (path.startsWith('admin')) {
    const adminCheck = requireAdmin(request);
    if (!adminCheck.authorized) {
      return adminCheck.response!;
    }
  }

  if (path.startsWith('admin/kyc/')) {
    return NextResponse.json({ success: true, message: 'KYC action processed.' });
  }
  if (path.startsWith('admin/deposits/')) {
    return NextResponse.json({ success: true, message: 'Deposit review processed.' });
  }
  if (path.startsWith('admin/withdrawals/')) {
    return NextResponse.json({ success: true, message: 'Withdrawal review processed.' });
  }

  return NextResponse.json({ message: 'Route handler target not found' }, { status: 404 });
}

// PATCH operations for admin status/approvals
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');

  // All Admin PATCH operations require Admin authority
  if (path.startsWith('admin')) {
    const adminCheck = requireAdmin(request);
    if (!adminCheck.authorized) {
      return adminCheck.response!;
    }
    return NextResponse.json({ success: true, message: 'Admin PATCH action executed successfully.' });
  }

  return NextResponse.json({ message: 'Target path not found' }, { status: 404 });
}

// PUT operations
export async function PUT(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');

  if (!verifyAuth(request)) {
    return NextResponse.json({ message: '401 Unauthorized.' }, { status: 401 });
  }

  if (path.startsWith('watchlist/')) {
    const wlId = route[1];
    const body = await request.json();
    const wl = sessionWatchlists.find(w => w.id === wlId);
    if (wl) {
      wl.name = body.name;
      return NextResponse.json(wl);
    }
    return NextResponse.json({ message: 'Watchlist not found' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Target path not found' }, { status: 404 });
}

// DELETE operations
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const path = route.join('/');

  if (!verifyAuth(request)) {
    return NextResponse.json({ message: '401 Unauthorized.' }, { status: 401 });
  }

  if (path.startsWith('watchlist/') && route.length === 2) {
    const wlId = route[1];
    sessionWatchlists = sessionWatchlists.filter(w => w.id !== wlId);
    return NextResponse.json({ success: true });
  }

  if (path.startsWith('watchlist/') && route[2] === 'stocks') {
    const wlId = route[1];
    const symbol = route[3];
    const wl = sessionWatchlists.find(w => w.id === wlId);
    if (wl) {
      wl.symbols = wl.symbols.filter(sym => sym !== symbol);
      return NextResponse.json(wl);
    }
    return NextResponse.json({ message: 'Watchlist not found' }, { status: 404 });
  }

  if (path.startsWith('alerts/')) {
    const id = route[1];
    alerts = alerts.filter(a => a.id !== id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Target path not found' }, { status: 404 });
}
