'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertOctagon, 
  MapPin, 
  Clock, 
  Lock, 
  CheckCircle,
  Info,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';
import { FraudAlert, SecurityDatabase } from '@/lib/securityMock';

interface AntiFraudDeskProps {
  alerts: FraudAlert[];
  onResolveAlert: (id: string) => void;
  logAction: (action: string) => void;
}

export default function AntiFraudDesk({
  alerts,
  onResolveAlert,
  logAction
}: AntiFraudDeskProps) {
  const [isWdFrozen, setIsWdFrozen] = useState(SecurityDatabase.isWithdrawalFrozen());

  const handleToggleFreeze = () => {
    const nextVal = !isWdFrozen;
    setIsWdFrozen(nextVal);
    SecurityDatabase.setWithdrawalFrozen(nextVal);
    logAction(nextVal ? 'Executed emergency freeze on all funds withdrawals.' : 'Lifted emergency freeze on withdrawals.');
    
    if (nextVal) {
      toast.error('Emergency Freeze Activated! Withdrawals are locked.');
    } else {
      toast.success('Withdrawal Freeze Deactivated. Normal channels restored.');
    }
  };

  const handleResolveAlertClick = (id: string, type: string) => {
    onResolveAlert(id);
    logAction(`Acknowledged and resolved fraud incident alert: ${type}`);
    toast.success('Incident alert marked as resolved.');
  };

  const getSeverityBadge = (sev: FraudAlert['severity']) => {
    if (sev === 'High') return 'bg-bearish/10 text-bearish border-bearish/25';
    if (sev === 'Medium') return 'bg-amber-500/10 text-amber-500 border-amber-500/25';
    return 'bg-primary/10 text-primary border-primary/25';
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="space-y-6">
      {/* Emergency Lockdown Action */}
      <Card className="bg-panel border-border/80 relative overflow-hidden group">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isWdFrozen ? 'bg-bearish animate-pulse' : 'bg-primary'}`} />
        <CardHeader className="pb-3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <UserX className="w-4 h-4 text-bearish" /> Emergency Account Lockdown
            </CardTitle>
            <CardDescription className="text-xs">Instantly freeze all fund transfers, API keys, and trading withdrawals in case of suspected breach.</CardDescription>
          </div>
          <Button
            onClick={handleToggleFreeze}
            variant={isWdFrozen ? 'default' : 'outline'}
            className={`cursor-pointer shrink-0 font-bold text-xs gap-1.5 ${
              isWdFrozen ? 'bg-bearish hover:bg-bearish/90 text-white animate-pulse' : 'border-bearish/30 text-bearish hover:bg-bearish/10'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {isWdFrozen ? 'Withdrawals Frozen' : 'Freeze Withdrawals'}
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts list */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-bearish" /> Anti-Fraud Incident Alerts
              </CardTitle>
              <CardDescription className="text-xs">Suspicious geolocations, IP ranges, or brute force signatures.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {activeAlerts.length === 0 && resolvedAlerts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground font-semibold">
                  No anti-fraud warnings on record.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Alerts */}
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className="border border-bearish/25 bg-bearish-muted/5 rounded-xl p-4 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[8px] uppercase tracking-wider font-bold border ${getSeverityBadge(alert.severity)}`}>
                            {alert.severity} RISK
                          </Badge>
                          <span className="font-extrabold text-foreground">{alert.alertType}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="xs" 
                          onClick={() => handleResolveAlertClick(alert.id, alert.alertType)}
                          className="text-[9px] font-bold py-1 border-primary/20 hover:bg-primary/5 text-primary cursor-pointer flex items-center shrink-0 bg-card"
                        >
                          Resolve Alert
                        </Button>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[9px] text-muted-foreground pt-1.5 border-t border-border/40 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" /> {new Date(alert.timestamp).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" /> {alert.location} ({alert.ipAddress})
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Resolved Alerts (Archived) */}
                  {resolvedAlerts.map((alert) => (
                    <div key={alert.id} className="border border-border/40 bg-muted/10 rounded-xl p-3.5 space-y-2 text-xs opacity-75">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-muted text-muted-foreground border-border/60 text-[8px] uppercase tracking-wider font-bold">
                            RESOLVED
                          </Badge>
                          <span className="font-bold text-muted-foreground line-through">{alert.alertType}</span>
                        </div>
                        <span className="text-[9px] text-bullish font-bold flex items-center gap-1 font-sans">
                          <CheckCircle className="w-3 h-3" /> Audited
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations Panel */}
        <Card className="bg-panel border-border/80 h-fit">
          <CardHeader className="pb-3 p-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> Guard Node AI Intelligence
            </CardTitle>
            <CardDescription className="text-xs">Machine-learning heuristics monitoring platform logins.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs leading-relaxed">
            <div className="border border-border/60 rounded-lg p-3 bg-muted/20 space-y-2.5">
              <span className="font-bold text-foreground block">Session Security Index</span>
              <p className="text-[10px] text-muted-foreground">
                Your device signature footprint is matched against a whitelist of 3 known hardware configurations. Currently, 1 session originates from a different geographical zone.
              </p>
              <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-bullish animate-pulse shrink-0" />
                Heuristic scanner online.
              </div>
            </div>

            <div className="border border-border/60 rounded-lg p-3 bg-muted/20 space-y-2.5">
              <span className="font-bold text-foreground block">Anti-Phishing Shield</span>
              <p className="text-[10px] text-muted-foreground font-sans">
                Always ensure the URL displayed in the address bar is strictly: <span className="font-semibold text-primary">localhost:3000</span>.
                StockInside Trading security guards will never request your passwords or 2FA secret recovery codes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
