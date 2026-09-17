import React from 'react';
import { WalletState } from '@/lib/walletMock';
import { motion } from 'framer-motion';
import { 
  Coins, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock
} from 'lucide-react';

interface WalletKPIsProps {
  metrics: WalletState;
}

export default function WalletKPIs({ metrics }: WalletKPIsProps) {
  const isPositivePL = metrics.todayPL >= 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: 'easeOut' as const
      }
    })
  };

  const kpis = [
    {
      title: "Total Balance",
      value: `$${metrics.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Combined cash, investments & pending",
      icon: Coins,
      color: "from-indigo-500/20 to-purple-500/20",
      iconColor: "text-indigo-400",
      glow: "shadow-[0_0_15px_rgba(99,102,241,0.15)]"
    },
    {
      title: "Available Cash",
      value: `$${metrics.availableCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Withdrawable or ready to invest",
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]"
    },
    {
      title: "Invested Amount",
      value: `$${metrics.investedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Allocated in active market positions",
      icon: Briefcase,
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]"
    },
    {
      title: "Today's Profit/Loss",
      value: `${isPositivePL ? '+' : ''}$${metrics.todayPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${isPositivePL ? '+' : ''}${metrics.todayPLPercent.toFixed(2)}% vs. yesterday`,
      icon: isPositivePL ? TrendingUp : TrendingDown,
      color: isPositivePL ? "from-emerald-500/20 to-emerald-600/25" : "from-rose-500/20 to-rose-600/25",
      iconColor: isPositivePL ? "text-emerald-400" : "text-rose-400",
      glow: isPositivePL ? "shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
      trendBadge: true
    },
    {
      title: "Pending Deposits",
      value: `$${metrics.pendingDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Awaiting bank clearance verification",
      icon: ArrowUpRight,
      color: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]"
    },
    {
      title: "Pending Withdrawals",
      value: `$${metrics.pendingWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "In queue for bank account transfer",
      icon: ArrowDownRight,
      color: "from-amber-500/20 to-rose-500/20",
      iconColor: "text-rose-400/90",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.title}
            custom={idx}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className={`relative rounded-xl border border-panel-border/80 bg-card p-6 flex flex-col justify-between overflow-hidden group hover:border-border/60 transition-all duration-300 ${kpi.glow}`}
          >
            {/* Background Glow Gradient */}
            <div className={`absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br ${kpi.color} blur-[30px] opacity-60 group-hover:scale-125 transition-transform duration-500`} />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
                  {kpi.title}
                </span>
                <h3 className="text-2xl font-extrabold text-foreground font-mono tracking-tight leading-none">
                  {kpi.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-lg bg-panel border border-border/20 ${kpi.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between relative z-10">
              <span className="text-[11px] text-muted-foreground leading-none">
                {kpi.subtitle}
              </span>
              {kpi.trendBadge && (
                <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono leading-none ${
                  isPositivePL ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {isPositivePL ? '+' : ''}{metrics.todayPLPercent.toFixed(1)}%
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
