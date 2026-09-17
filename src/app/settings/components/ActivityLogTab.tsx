import React, { useState } from 'react';
import { ActivityLog } from '@/lib/profileMock';
import { Transaction } from '@/lib/walletMock';
import { Calendar, Search, Shield, ArrowUpRight, ArrowDownRight, Smartphone, Key } from 'lucide-react';

interface ActivityLogTabProps {
  logs: ActivityLog[];
  transactions: Transaction[];
}

export default function ActivityLogTab({ logs, transactions }: ActivityLogTabProps) {
  const [filterType, setFilterType] = useState<string>('All');
  
  // Format transaction logs to fit ActivityLog structure
  const formattedTxnLogs: ActivityLog[] = transactions.map((t) => ({
    id: t.id,
    event: `${t.type} Cleared - ${t.method}`,
    timestamp: t.date,
    device: t.bankAccountMask || t.utr || 'System Ledger',
    status: (t.status === 'Completed' || t.status === 'Approved') ? 'Success' : t.status === 'Rejected' ? 'Failed' : 'Info'
  }));

  // Combine logs and transactions, sort by date
  const combinedLogs = [...logs, ...formattedTxnLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = combinedLogs.filter((log) => {
    if (filterType === 'All') return true;
    if (filterType === 'Security') return log.event.toLowerCase().includes('password') || log.event.toLowerCase().includes('mfa') || log.event.toLowerCase().includes('pin');
    if (filterType === 'Login') return log.event.toLowerCase().includes('login');
    if (filterType === 'Ledger') return log.event.toLowerCase().includes('deposit') || log.event.toLowerCase().includes('withdrawal') || log.event.toLowerCase().includes('refund') || log.event.toLowerCase().includes('buy') || log.event.toLowerCase().includes('bonus');
    return true;
  });

  const getStatusDotClass = (status: ActivityLog['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-400';
      case 'Failed':
        return 'bg-rose-400';
      case 'Warning':
        return 'bg-amber-400';
      default:
        return 'bg-blue-400';
    }
  };

  const getLogIcon = (event: string) => {
    const clean = event.toLowerCase();
    if (clean.includes('login')) return <Smartphone className="w-3.5 h-3.5 text-indigo-400" />;
    if (clean.includes('password') || clean.includes('mfa') || clean.includes('pin')) return <Key className="w-3.5 h-3.5 text-indigo-400" />;
    if (clean.includes('deposit') || clean.includes('bonus')) return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
    if (clean.includes('withdrawal') || clean.includes('buy')) return <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />;
    return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="space-y-4 text-left">
      {/* Filters row */}
      <div className="flex items-center justify-between gap-3 bg-panel/30 border border-border/30 rounded-xl p-4 text-xs">
        <div>
          <span className="text-muted-foreground uppercase text-[9px] font-bold font-mono block">Auditing Filters</span>
          <span className="text-foreground font-semibold">Track profile lifecycle operations logs.</span>
        </div>

        <div className="flex gap-2">
          {['All', 'Security', 'Login', 'Ledger'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 font-bold rounded-lg border text-center transition-all cursor-pointer ${
                filterType === t 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border bg-panel hover:bg-muted text-muted-foreground'
              }`}
            >
              {t === 'All' ? 'All Activities' : `${t} Logs`}
            </button>
          ))}
        </div>
      </div>

      {/* Log list card */}
      <div className="rounded-xl border border-panel-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-panel/30 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                <th className="py-2.5 px-4">Event Log</th>
                <th className="py-2.5 px-4">Audited Session / Target</th>
                <th className="py-2.5 px-4 font-mono">Timestamp</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-muted-foreground font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-muted-foreground font-sans">
                    No activity logs recorded matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-panel/10">
                    <td className="py-3 px-4 font-sans font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-panel border border-border/20">
                          {getLogIcon(log.event)}
                        </div>
                        {log.event}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans text-muted-foreground text-[11px] truncate max-w-[200px]">
                      {log.device}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {new Date(log.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClass(log.status)}`} />
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
