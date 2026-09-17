'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  FileClock, 
  TrendingUp, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity,
  Cpu,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { AdminUser, KycSubmission, DepositRequest, WithdrawalRequest } from '@/lib/adminMock';

interface DashboardViewProps {
  users: AdminUser[];
  kyc: KycSubmission[];
  deposits: DepositRequest[];
  withdrawals: WithdrawalRequest[];
}

export default function DashboardView({
  users,
  kyc,
  deposits,
  withdrawals
}: DashboardViewProps) {
  // Dynamically compute KPIs
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.accountStatus === 'Active').length;
  const verifiedUsers = users.filter(u => u.kycStatus === 'Approved').length;
  const kycPending = kyc.filter(k => k.status === 'Pending').length;
  
  const totalWalletBalance = users.reduce((sum, u) => sum + u.walletBalance, 0);
  const pendingDepositsCount = deposits.filter(d => d.status === 'Pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'Pending').length;
  
  // Calculate mock revenue based on approved deposits or transaction fees
  const approvedDepositsSum = deposits
    .filter(d => d.status === 'Approved')
    .reduce((sum, d) => sum + d.amount, 0);
  const todayRevenue = 4250.00 + (approvedDepositsSum * 0.0015); // base fee + 0.15% processing fee

  const mockTotalTrades = 1482;
  const mockActiveSessions = 8;

  // 1. Revenue Chart Data (Hourly intraday)
  const revenueData = [
    { time: '09:30', revenue: 1200 },
    { time: '10:30', revenue: 1850 },
    { time: '11:30', revenue: 2400 },
    { time: '12:30', revenue: 2100 },
    { time: '13:30', revenue: 3100 },
    { time: '14:30', revenue: 3800 },
    { time: '15:30', revenue: 4150 },
    { time: '16:00', revenue: todayRevenue },
  ];

  // 2. User Growth Data (past 7 days)
  const userGrowthData = [
    { day: 'Jul 10', users: 4 },
    { day: 'Jul 11', users: 5 },
    { day: 'Jul 12', users: 6 },
    { day: 'Jul 13', users: 6 },
    { day: 'Jul 14', users: 7 },
    { day: 'Jul 15', users: 8 },
    { day: 'Jul 16', users: totalUsers },
  ];

  // 3. Trading Volume (Buy vs Sell mock comparison)
  const tradingVolumeData = [
    { day: 'Mon', Buy: 42000, Sell: 31000 },
    { day: 'Tue', Buy: 51000, Sell: 48000 },
    { day: 'Wed', Buy: 68000, Sell: 55000 },
    { day: 'Thu', Buy: 74000, Sell: 62000 },
    { day: 'Fri', Buy: 89000, Sell: 71000 },
  ];

  // 4. Market Sector Allocation Data
  const marketActivityData = [
    { name: 'Tech Equities', value: 45 },
    { name: 'Digital Assets', value: 30 },
    { name: 'Foreign Forex', value: 15 },
    { name: 'Energy/Commodities', value: 10 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const stats = [
    { title: 'Total Registered', value: totalUsers, icon: Users, desc: '+12.5% vs last month', trend: 'bullish' },
    { title: 'Active Accounts', value: activeUsers, icon: UserCheck, desc: '90.2% active ratio', trend: 'bullish' },
    { title: 'KYC Verified', value: verifiedUsers, icon: FileClock, desc: `${((verifiedUsers/totalUsers)*100).toFixed(0)}% verification rate`, trend: 'bullish' },
    { title: 'Pending KYC Documents', value: kycPending, icon: FileClock, desc: 'Requires manual review', trend: kycPending > 0 ? 'bearish' : 'neutral' },
    { title: 'Today\'s Revenue', value: `$${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, desc: '0.15% processing fee cut', trend: 'bullish' },
    { title: 'Custody Wallet Balance', value: `$${totalWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wallet, desc: 'Aggregate user funds', trend: 'bullish' },
    { title: 'Pending Deposits', value: pendingDepositsCount, icon: ArrowDownCircle, desc: 'Awaiting UTR match', trend: pendingDepositsCount > 0 ? 'bearish' : 'neutral' },
    { title: 'Pending Withdrawals', value: pendingWithdrawalsCount, icon: ArrowUpCircle, desc: 'Requires clearing approval', trend: pendingWithdrawalsCount > 0 ? 'bearish' : 'neutral' },
    { title: 'Trades Processed (24h)', value: mockTotalTrades, icon: Activity, desc: 'Average execution: 12ms', trend: 'bullish' },
    { title: 'Active Quant Sessions', value: mockActiveSessions, icon: Cpu, desc: 'Live socket channels', trend: 'bullish' },
  ];

  return (
    <div className="space-y-6">
      {/* 10 Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-panel border-border/80 hover:border-primary/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
            {/* Hover glow background card */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                {stat.title}
              </span>
              <stat.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                {stat.trend === 'bullish' && <ArrowUpRight className="w-3 h-3 text-bullish shrink-0" />}
                {stat.trend === 'bearish' && <ArrowDownRight className="w-3 h-3 text-bearish shrink-0" />}
                <span className={stat.trend === 'bullish' ? 'text-bullish' : stat.trend === 'bearish' ? 'text-bearish' : ''}>
                  {stat.desc}
                </span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intraday Revenue Chart */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold tracking-tight">System Revenue (USD)</CardTitle>
            <CardDescription className="text-xs">Real-time processing commission fees mapping.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 40%)" />
                <XAxis dataKey="time" stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(var(--card))', borderColor: 'oklch(var(--border))', color: 'oklch(var(--foreground))' }}
                  labelClassName="text-xs font-mono font-bold"
                  itemStyle={{ fontSize: '11px', color: 'oklch(var(--primary))' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold tracking-tight">User Registrations (Cumulative)</CardTitle>
            <CardDescription className="text-xs">Institutional client onboarding growth.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 40%)" />
                <XAxis dataKey="day" stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(var(--card))', borderColor: 'oklch(var(--border))', color: 'oklch(var(--foreground))' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trading Volumes (Buy vs Sell) */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold tracking-tight">Institutional Trading Volumes (USD)</CardTitle>
            <CardDescription className="text-xs">Daily buy execution vs sell execution volumes comparison.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tradingVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border) / 40%)" />
                <XAxis dataKey="day" stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="oklch(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(var(--card))', borderColor: 'oklch(var(--border))' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Bar dataKey="Buy" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sell" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Sectors Activity */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold tracking-tight">Sector Asset Allocation</CardTitle>
            <CardDescription className="text-xs">Aggregate customer custody percentage distributions.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-center p-2">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={marketActivityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {marketActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'oklch(var(--card))', borderColor: 'oklch(var(--border))' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Grid Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium px-4 mt-2">
              {marketActivityData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 justify-center">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-muted-foreground truncate">{item.name}:</span>
                  <span className="text-foreground font-mono font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
