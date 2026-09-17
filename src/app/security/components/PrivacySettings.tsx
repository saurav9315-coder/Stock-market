'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trash2, 
  Download, 
  Mail, 
  Smartphone, 
  Bell, 
  DollarSign, 
  Sliders, 
  Clock,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { SecurityDatabase, SecurityEventLog } from '@/lib/securityMock';
import { loadProfile, loadDevices, UserSettings } from '@/lib/profileMock';
import { loadTransactions } from '@/lib/walletMock';

interface PrivacySettingsProps {
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
  logAction: (action: string, status?: SecurityEventLog['status']) => void;
}

export default function PrivacySettings({
  settings,
  onUpdateSettings,
  logAction
}: PrivacySettingsProps) {
  // Withdrawal limits
  const [wdLimit, setWdLimit] = useState(SecurityDatabase.getWithdrawalLimit());
  const [newLimit, setNewLimit] = useState('');
  const [isWdDelay, setIsWdDelay] = useState(SecurityDatabase.isWithdrawalDelayEnabled());

  const handleUpdateLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newLimit);
    if (isNaN(val) || val <= 0) return toast.error('Enter a valid positive number');
    SecurityDatabase.setWithdrawalLimit(val);
    setWdLimit(val);
    logAction(`Updated daily cash withdrawal limit to: $${val}`);
    toast.success(`Daily withdrawal limit set to $${val}`);
    setNewLimit('');
  };

  const handleToggleDelay = () => {
    const nextVal = !isWdDelay;
    setIsWdDelay(nextVal);
    SecurityDatabase.setWithdrawalDelayEnabled(nextVal);
    logAction(nextVal ? 'Activated withdrawal clearance delays.' : 'Deactivated withdrawal clearance delays.');
    toast.success(nextVal ? 'Withdrawal clearance delay activated (24h)' : 'Withdrawal delay deactivated');
  };

  // Personal data downloader
  const handleDownloadData = () => {
    const data = {
      profile: loadProfile(),
      devices: loadDevices(),
      transactions: loadTransactions(),
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockInside_Trading_Personal_Data_Audit.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('Downloaded personal account ledger audit JSON file.');
    toast.success('Personal data export dispatched');
  };

  const handleDeleteAccount = () => {
    const inputName = prompt('CRITICAL WARNING: This action triggers permanent erasure. Type "DELETE" to submit request to compliance nodes.');
    if (inputName === 'DELETE') {
      logAction('Logged formal account erasure request with compliance audits.', 'Warning');
      toast.success('Account erasure request submitted for audit review.');
    } else {
      toast.info('Erasure request cancelled.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Withdrawal limits */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-3 p-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Withdrawal Security Configurations
            </CardTitle>
            <CardDescription className="text-xs">Limit payout limits or configure clearances holds to secure capital.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs font-medium">
            
            {/* Daily limit */}
            <form onSubmit={handleUpdateLimitSubmit} className="space-y-2 border-b border-border/40 pb-4">
              <label className="text-muted-foreground font-semibold block">
                Daily Withdrawal Limit (Current: <span className="text-foreground font-bold font-mono">${wdLimit.toLocaleString()}</span>)
              </label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  placeholder="e.g. 100000"
                  value={newLimit}
                  onChange={e => setNewLimit(e.target.value)}
                  className="bg-card text-xs h-9"
                  required
                />
                <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold font-sans">
                  Set Limit
                </Button>
              </div>
            </form>

            {/* Delay configurations */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> 24-Hour Withdrawal Delay
                </span>
                <span className="text-[10px] text-muted-foreground block">Holds transfers for 24h to audit security alerts</span>
              </div>
              <input 
                type="checkbox"
                checked={isWdDelay}
                onChange={handleToggleDelay}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Notification Alerts matrix */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-3 p-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Alerts Notification Channels
            </CardTitle>
            <CardDescription className="text-xs">Configure where you receive high-priority security notifications.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4 text-xs font-medium">
            <div className="space-y-3">
              {/* Email channel */}
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-foreground font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" /> Email Messages
                </span>
                <input 
                  type="checkbox"
                  checked={settings.emailNotif}
                  onChange={e => {
                    onUpdateSettings({ emailNotif: e.target.checked });
                    logAction(e.target.checked ? 'Enabled Email notifications channel.' : 'Disabled Email notifications channel.');
                    toast.success(e.target.checked ? 'Email notifications enabled' : 'Email channel deactivated');
                  }}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
              </div>

              {/* Push channel */}
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-foreground font-bold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-muted-foreground" /> Push Notifications
                </span>
                <input 
                  type="checkbox"
                  checked={settings.pushNotif}
                  onChange={e => {
                    onUpdateSettings({ pushNotif: e.target.checked });
                    logAction(e.target.checked ? 'Enabled Push notifications channel.' : 'Disabled Push notifications channel.');
                    toast.success(e.target.checked ? 'Push notifications active' : 'Push channel deactivated');
                  }}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
              </div>

              {/* SMS Channel */}
              <div className="flex items-center justify-between border-b border-border/20 pb-2">
                <span className="text-foreground font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" /> SMS Mobile Alerts
                </span>
                <input 
                  type="checkbox"
                  checked={settings.smsNotif} // mapping to settings
                  onChange={e => {
                    onUpdateSettings({ smsNotif: e.target.checked });
                    logAction(e.target.checked ? 'Enabled SMS contact alerts channel.' : 'Disabled SMS contact alerts channel.');
                    toast.success(e.target.checked ? 'SMS contact channel active' : 'SMS channel deactivated');
                  }}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Tools Center */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-primary" /> Privacy & Erase Tools Center
          </CardTitle>
          <CardDescription className="text-xs">Download personal assets data or request account cancellation under GDPR/CCPA compliance.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs">
          <div className="space-y-3.5 max-w-xl">
            <div className="space-y-1">
              <span className="font-bold text-foreground block">Personal Data Export</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Download a machine-readable JSON file containing your profile parameters, authorized device logs, bank registries, and transaction reports.
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="font-bold text-foreground block">Permanent Erasure</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This dispatches an account deletion request to verification administrators. Account assets, orders, API credentials, and historical logs will be completely scrubbed.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <Button variant="outline" onClick={handleDownloadData} className="gap-1.5 cursor-pointer text-xs font-bold">
              <Download className="w-4 h-4" /> Download Personal Data
            </Button>
            <Button variant="outline" onClick={handleDeleteAccount} className="border-bearish/30 text-bearish hover:bg-bearish/10 gap-1.5 cursor-pointer text-xs font-bold">
              <Trash2 className="w-4 h-4" /> Delete Account Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
