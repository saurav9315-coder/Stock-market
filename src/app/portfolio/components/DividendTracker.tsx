'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, Percent, Gift, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface UpcomingDividend {
  symbol: string;
  company: string;
  payout: number;
  exDate: string;
  payDate: string;
}

interface HistoricalDividend {
  date: string;
  symbol: string;
  amount: number;
}

interface DividendTrackerProps {
  isLoading?: boolean;
  dividends: {
    annualIncome: number;
    averageYield: number;
    upcoming: UpcomingDividend[];
    history: HistoricalDividend[];
  };
}

export default function DividendTracker({
  isLoading = false,
  dividends
}: DividendTrackerProps) {
  // Monthly dividend distribution chart mock
  const monthlyProjectionData = [
    { month: 'Jan', amount: dividends.annualIncome * 0.05 },
    { month: 'Feb', amount: dividends.annualIncome * 0.08 },
    { month: 'Mar', amount: dividends.annualIncome * 0.12 },
    { month: 'Apr', amount: dividends.annualIncome * 0.06 },
    { month: 'May', amount: dividends.annualIncome * 0.07 },
    { month: 'Jun', amount: dividends.annualIncome * 0.15 },
    { month: 'Jul', amount: dividends.annualIncome * 0.05 },
    { month: 'Aug', amount: dividends.annualIncome * 0.09 },
    { month: 'Sep', amount: dividends.annualIncome * 0.11 },
    { month: 'Oct', amount: dividends.annualIncome * 0.07 },
    { month: 'Nov', amount: dividends.annualIncome * 0.05 },
    { month: 'Dec', amount: dividends.annualIncome * 0.10 },
  ];

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[350px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Gift className="w-4 h-4 text-primary" /> Dividend Yield & Income Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Metric Summaries & Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income Yield Metrics */}
          <div className="space-y-4 font-mono">
            <div className="bg-secondary/40 border border-border/60 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Projected Annual Income</span>
              <p className="text-2xl font-black text-foreground">
                ${dividends.annualIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] text-muted-foreground block">Based on equity dividend announcements</span>
            </div>

            <div className="bg-secondary/40 border border-border/60 rounded-xl p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Average Dividend Yield</span>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-black text-foreground">
                  {dividends.averageYield.toFixed(2)}%
                </p>
                <span className="text-xs font-bold text-emerald-500 flex items-center">
                  <TrendingUp className="w-3 h-3" /> +0.15% MoM
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground block">Equity portfolio weighted average yield</span>
            </div>
          </div>

          {/* Monthly distribution chart */}
          <div className="lg:col-span-2 space-y-2">
            <h4 className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-wider pl-1">Projected Monthly Dividend Cash Flow</h4>
            <div className="h-44 w-full bg-secondary/20 rounded-xl p-2 border border-border/30">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProjectionData}>
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)', fontSize: '10px' }} />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ledger listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/40 font-mono text-xs">
          {/* Upcoming Schedule */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Upcoming dividend payments
            </h4>
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2 px-3 text-[10px] uppercase font-bold">Asset</TableHead>
                    <TableHead className="py-2 px-3 text-right text-[10px] uppercase font-bold">Projected Credit</TableHead>
                    <TableHead className="py-2 px-3 text-center text-[10px] uppercase font-bold">Pay Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.upcoming.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-[10px]">
                        No upcoming dividends declared.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dividends.upcoming.map((div) => (
                      <TableRow key={div.symbol} className="hover:bg-secondary/35 border-border/30">
                        <TableCell className="py-2 px-3 font-bold text-foreground">{div.symbol}</TableCell>
                        <TableCell className="py-2 px-3 text-right font-extrabold text-foreground">${div.payout.toFixed(2)}</TableCell>
                        <TableCell className="py-2 px-3 text-center text-muted-foreground font-semibold">{div.payDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Historical Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-primary" /> Credited payments history
            </h4>
            <div className="border border-border/40 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/40">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2 px-3 text-[10px] uppercase font-bold">Date</TableHead>
                    <TableHead className="py-2 px-3 text-[10px] uppercase font-bold">Asset</TableHead>
                    <TableHead className="py-2 px-3 text-right text-[10px] uppercase font-bold">Amount Received</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividends.history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground text-[10px]">
                        No historical dividends recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    dividends.history.map((div, index) => (
                      <TableRow key={`${div.symbol}-${index}`} className="hover:bg-secondary/35 border-border/30">
                        <TableCell className="py-2 px-3 text-muted-foreground">{div.date}</TableCell>
                        <TableCell className="py-2 px-3 font-bold text-foreground">{div.symbol}</TableCell>
                        <TableCell className="py-2 px-3 text-right font-extrabold text-emerald-500">+${div.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
