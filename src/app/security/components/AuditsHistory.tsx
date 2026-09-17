'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Search, 
  Filter, 
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { SecurityEventLog, SecurityCheckItem } from '@/lib/securityMock';

interface AuditsHistoryProps {
  eventLogs: SecurityEventLog[];
  checklist: SecurityCheckItem[];
  onTriggerOptimizations: (tab: string) => void;
  logAction: (action: string) => void;
}

export default function AuditsHistory({
  eventLogs,
  checklist,
  onTriggerOptimizations,
  logAction
}: AuditsHistoryProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Success' | 'Failed' | 'Warning'>('All');
  const [isScanning, setIsScanning] = useState(false);

  // Filter logs
  const filteredLogs = eventLogs.filter((log) => {
    const matchesSearch = 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.device.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunSecurityAudit = () => {
    setIsScanning(true);
    toast.loading('StockInside AI auditing account configurations...');
    setTimeout(() => {
      setIsScanning(false);
      toast.dismiss();
      logAction('Executed live AI account Security Audit.');
      toast.success('AI Security Audit scan completed. Account score computed successfully.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* AI Security Checkup */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> AI Account Security Audit
            </CardTitle>
            <CardDescription className="text-xs">Audit active credentials configurations, device sessions, and transaction parameters.</CardDescription>
          </div>
          <Button 
            onClick={handleRunSecurityAudit} 
            disabled={isScanning}
            className="cursor-pointer gap-1.5 text-xs font-bold text-white shadow"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning Node...' : 'Run Security Checkup'}
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklist.map((item) => (
              <div 
                key={item.id} 
                className="border border-border/60 rounded-xl p-3.5 bg-card/25 flex items-start gap-3.5 text-xs"
              >
                <div className="shrink-0 mt-0.5">
                  {item.status === 'secure' ? (
                    <CheckCircle2 className="w-5 h-5 text-bullish" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 text-bearish" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground block">{item.name}</span>
                    <Badge variant={item.status === 'secure' ? 'default' : item.status === 'warning' ? 'secondary' : 'destructive'} className="text-[8px] uppercase tracking-wider font-bold py-0.5 leading-none">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  {item.status !== 'secure' && (
                    <div className="pt-1.5 flex items-center justify-between gap-4">
                      <span className="text-[10px] text-primary italic font-medium">Recommendation: {item.recommendation}</span>
                      <Button 
                        variant="ghost" 
                        size="xs"
                        onClick={() => {
                          if (item.id === 'chk-2fa' || item.id === 'chk-passkey') onTriggerOptimizations('access');
                          else if (item.id === 'chk-phone') onTriggerOptimizations('privacy');
                          else if (item.id === 'chk-devices') onTriggerOptimizations('sessions');
                        }}
                        className="text-[9px] font-bold py-1 text-primary cursor-pointer hover:bg-primary/5 flex items-center border border-primary/20 shrink-0"
                      >
                        Fix Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History Log */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> Login Authorization Audit Logs
          </CardTitle>
          <CardDescription className="text-xs">Tracks recent platform logins, authorization tokens, and credentials challenges.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search event logs by browser, country, device, IP..."
                className="pl-9 text-xs bg-card h-9"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'All' | 'Success' | 'Failed' | 'Warning')}
                className="bg-card border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none cursor-pointer h-9 w-32"
              >
                <option value="All">All Statuses</option>
                <option value="Success">Success Only</option>
                <option value="Failed">Failed Only</option>
                <option value="Warning">Warnings Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-border/40 rounded-lg">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent bg-muted/20">
                  <TableHead className="text-muted-foreground font-bold">Event Type</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Device / Browser</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Location / IP Address</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Timestamp</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold">Status Badge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                      No matching audit logs located.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-b border-border/20 hover:bg-card/20 transition-colors">
                      <TableCell className="font-semibold text-foreground py-3">{log.event}</TableCell>
                      <TableCell className="text-muted-foreground py-3">
                        <span className="block font-medium">{log.device}</span>
                        <span className="text-[10px] text-muted-foreground block">{log.browser}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3">
                        <span className="block font-medium">{log.location}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">{log.ipAddress}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Badge 
                          className={`text-[8px] font-mono tracking-wider uppercase font-bold ${
                            log.status === 'Success' ? 'bg-bullish/15 text-bullish border-bullish/30' : 
                            log.status === 'Failed' ? 'bg-bearish/15 text-bearish border-bearish/30' : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                          }`}
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
