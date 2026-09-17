'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  ShieldX,
  Smartphone, 
  Laptop, 
  Clock, 
  History, 
  ArrowRight,
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { SecurityCheckItem, SecurityScoreCard } from '@/lib/securityMock';

interface SecurityOverviewProps {
  scoreCard: SecurityScoreCard;
  checklist: SecurityCheckItem[];
  onNavigateTab: (tab: string) => void;
}

export default function SecurityOverview({
  scoreCard,
  checklist,
  onNavigateTab
}: SecurityOverviewProps) {
  const { score, lastLogin, activeSessionsCount, trustedDevicesCount, failedLoginsCount } = scoreCard;

  // Progress ring variables
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color selection based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'stroke-bullish text-bullish border-bullish/25 bg-bullish/5';
    if (s >= 50) return 'stroke-amber-500 text-amber-500 border-amber-500/25 bg-amber-500/5';
    return 'stroke-bearish text-bearish border-bearish/25 bg-bearish/5';
  };

  const getScoreRingClass = (s: number) => {
    if (s >= 80) return 'text-bullish';
    if (s >= 50) return 'text-amber-500';
    return 'text-bearish';
  };

  const criticalIssues = checklist.filter(item => item.status === 'critical');
  const warningIssues = checklist.filter(item => item.status === 'warning');
  const secureIssues = checklist.filter(item => item.status === 'secure');

  return (
    <div className="space-y-6">
      {/* Top dashboard layout: Score progress ring + Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score progress ring Card */}
        <Card className="bg-panel border-border/80 flex flex-col items-center justify-center p-6 text-center select-none shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <CardHeader className="pb-2 p-0 w-full">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Overall Security Score</span>
          </CardHeader>

          <CardContent className="p-4 flex flex-col items-center space-y-4 w-full">
            {/* SVG Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle 
                  cx="72" 
                  cy="72" 
                  r={radius} 
                  className="stroke-muted fill-transparent" 
                  strokeWidth="8"
                />
                {/* Foreground animated progress circle */}
                <motion.circle 
                  cx="72" 
                  cy="72" 
                  r={radius} 
                  className={getScoreRingClass(score) + " fill-transparent stroke-current"} 
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              {/* Score text inside ring */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-foreground font-mono leading-none">{score}</span>
                <span className="text-[9px] font-bold text-muted-foreground mt-1 tracking-wider">/ 100</span>
              </div>
            </div>

            {/* Protection Badge */}
            <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getScoreColor(score)}`}>
              {score >= 80 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Checked & Protected
                </>
              ) : score >= 50 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Action Recommended
                </>
              ) : (
                <>
                  <ShieldX className="w-3.5 h-3.5 text-bearish animate-bounce" /> Account Vulnerable
                </>
              )}
            </div>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed max-w-xs">
              Based on verification channels, password strength, and active multi-factor verification modules.
            </p>
          </CardContent>
        </Card>

        {/* Actionable recommendations card */}
        <Card className="bg-panel border-border/80 md:col-span-2 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-primary" /> AI-Generated Security Optimization Checklist
            </CardTitle>
            <CardDescription className="text-xs">Dynamic recommendations generated by the StockInside Security Guard node.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-2 flex-1 flex flex-col justify-between">
            {/* List issues */}
            <div className="space-y-2.5 max-h-[30vh] overflow-y-auto scrollbar-thin">
              {/* Critical and Warnings first */}
              {[...criticalIssues, ...warningIssues, ...secureIssues].map((item) => (
                <div 
                  key={item.id}
                  className={`border rounded-lg p-2.5 flex items-start justify-between gap-3 text-xs ${
                    item.status === 'critical' ? 'bg-bearish-muted/5 border-bearish/20' : 
                    item.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/10 border-border/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.status === 'critical' ? 'bg-bearish' : 
                        item.status === 'warning' ? 'bg-amber-500' : 'bg-bullish'
                      }`} />
                      <span className="font-bold text-foreground">{item.name}</span>
                      <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'warning' ? 'secondary' : 'default'} className="text-[8px] py-0 leading-none h-4 font-mono font-bold uppercase shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>

                  {item.status !== 'secure' && (
                    <Button 
                      variant="outline" 
                      size="xs"
                      onClick={() => {
                        if (item.id === 'chk-2fa' || item.id === 'chk-passkey') onNavigateTab('access');
                        else if (item.id === 'chk-phone') onNavigateTab('privacy');
                        else if (item.id === 'chk-devices') onNavigateTab('sessions');
                      }}
                      className="text-[9px] py-1 border-primary/20 hover:bg-primary/5 text-primary shrink-0 gap-1.5 font-bold cursor-pointer bg-card flex items-center"
                    >
                      Optimize <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 select-none">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Last Login Timestamp</span>
            <span className="text-xs font-semibold text-foreground font-mono">
              {new Date(lastLogin).toLocaleString()}
            </span>
          </div>
          <Clock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Card>

        <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 select-none">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Active Session Nodes</span>
            <span className="text-lg font-bold text-foreground font-mono">{activeSessionsCount}</span>
          </div>
          <Laptop className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Card>

        <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 select-none">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Trusted Device Tokens</span>
            <span className="text-lg font-bold text-foreground font-mono">{trustedDevicesCount}</span>
          </div>
          <Smartphone className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Card>

        <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="space-y-1 select-none">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Failed Logins (24h)</span>
            <span className={`text-lg font-bold font-mono ${failedLoginsCount > 0 ? 'text-bearish' : 'text-foreground'}`}>
              {failedLoginsCount}
            </span>
          </div>
          <History className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Card>
      </div>
    </div>
  );
}
