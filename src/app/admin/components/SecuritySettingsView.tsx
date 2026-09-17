'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  ShieldAlert, 
  History, 
  Settings, 
  Save, 
  Search, 
  Building2, 
  AlertTriangle,
  Mail,
  Smartphone,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  PaymentConfiguration, 
  SecurityEvent, 
  AuditLogEntry, 
  SystemSettingsConfig,
  AdminDatabase
} from '@/lib/adminMock';

interface SecuritySettingsViewProps {
  paymentConfig: PaymentConfiguration;
  setPaymentConfig: (config: PaymentConfiguration) => void;
  securityEvents: SecurityEvent[];
  setSecurityEvents: (events: SecurityEvent[]) => void;
  auditLogs: AuditLogEntry[];
  setAuditLogs: (logs: AuditLogEntry[]) => void;
  systemSettings: SystemSettingsConfig;
  setSystemSettings: (settings: SystemSettingsConfig) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
  activeTabInit?: 'payments' | 'security' | 'audit' | 'settings';
}

export default function SecuritySettingsView({
  paymentConfig,
  setPaymentConfig,
  securityEvents,
  setSecurityEvents,
  auditLogs,
  setAuditLogs,
  systemSettings,
  setSystemSettings,
  logAction,
  permissions,
  activeTabInit = 'payments'
}: SecuritySettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'security' | 'audit' | 'settings'>(activeTabInit);
  const [searchAudit, setSearchAudit] = useState('');

  // Config States
  const [payForm, setPayForm] = useState<PaymentConfiguration>({ ...paymentConfig });
  const [sysForm, setSysForm] = useState<SystemSettingsConfig>({ ...systemSettings });

  // Permissions checkers
  const canModifyPayments = permissions.payments;
  const canModifySecurity = permissions.security;
  const canModifySettings = permissions.settings;
  const canViewAudit = permissions.audit;

  // Filtered Audits
  const filteredAudits = auditLogs.filter(log => 
    log.adminName.toLowerCase().includes(searchAudit.toLowerCase()) ||
    log.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
    log.adminRole.toLowerCase().includes(searchAudit.toLowerCase())
  );

  // ------------------------------------------
  // SAVE HANDLERS
  // ------------------------------------------
  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyPayments) return toast.error('Access Denied: Support and Content roles cannot alter settlement rules.');
    
    setPaymentConfig({ ...payForm });
    logAction(`Updated public asset bank config and UPI details.`);
    toast.success('Clearance settlement configurations updated');
  };

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifySettings) return toast.error('Access Denied: Only Super Admin has system parameters privileges.');

    setSystemSettings({ ...sysForm });
    logAction(`Modified platform parameters: "${sysForm.platformName}"`);
    toast.success('Basement system settings saved successfully');
  };

  // Toggle lock security state
  const handleResolveAlert = (id: string, current: string) => {
    if (!canModifySecurity) return toast.error('Access Denied');
    const updated = securityEvents.map(ev => {
      if (ev.id === id) return { ...ev, status: 'Verified' as const };
      return ev;
    });
    setSecurityEvents(updated);
    logAction(`Dismissed/Resolved Security Alert ID: ${id}`);
    toast.success('Security anomaly marked as Resolved');
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs selectors */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Settlement & QR
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Security Node Alerts
          <span className="px-1.5 py-0.5 text-[9px] bg-muted rounded text-muted-foreground font-mono">
            {securityEvents.filter(e => e.status !== 'Verified').length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="w-4 h-4" /> Admin Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="w-4 h-4" /> Platform Variables
        </button>
      </div>

      {/* 1. PAYMENTS SETTLEMENTS RULES */}
      {activeTab === 'payments' && (
        <form onSubmit={handleSavePayments} className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bank details card */}
            <Card className="bg-panel border-border/80 md:col-span-2">
              <CardHeader className="pb-3 p-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Company Clearing Account Details
                </CardTitle>
                <CardDescription className="text-xs">Configure where sandbox deposits are wired by users.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Holder Legal Name</label>
                  <Input 
                    value={payForm.holderName}
                    onChange={e => setPayForm({ ...payForm, holderName: e.target.value })}
                    required
                    disabled={!canModifyPayments}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Bank Name</label>
                  <Input 
                    value={payForm.bankName}
                    onChange={e => setPayForm({ ...payForm, bankName: e.target.value })}
                    required
                    disabled={!canModifyPayments}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Account Number</label>
                  <Input 
                    value={payForm.accountNumber}
                    onChange={e => setPayForm({ ...payForm, accountNumber: e.target.value })}
                    required
                    disabled={!canModifyPayments}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">IFSC/SWIFT Routing Code</label>
                  <Input 
                    value={payForm.ifscCode}
                    onChange={e => setPayForm({ ...payForm, ifscCode: e.target.value })}
                    required
                    disabled={!canModifyPayments}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Public UPI Handle</label>
                  <Input 
                    value={payForm.upiId}
                    onChange={e => setPayForm({ ...payForm, upiId: e.target.value })}
                    required
                    disabled={!canModifyPayments}
                  />
                </div>
              </CardContent>
            </Card>

            {/* QR preview and rules */}
            <Card className="bg-panel border-border/80">
              <CardHeader className="pb-3 p-5">
                <CardTitle className="text-sm font-bold">UPI QR Matrix Code</CardTitle>
                <CardDescription className="text-xs">Generated checkout QR image.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex flex-col items-center gap-4 text-xs">
                <div className="w-32 h-32 border border-border rounded overflow-hidden p-1 bg-card">
                  <img src={payForm.qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                </div>
                <div className="text-[10px] text-muted-foreground text-center leading-relaxed">
                  Tech-themed QR generated dynamically matching vector matrices.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Limits and fees card */}
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 p-5">
              <CardTitle className="text-sm font-bold">Deposit Limits & Clearance Fees</CardTitle>
              <CardDescription className="text-xs">Configure settlement processing ranges and fee percentages.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Minimum Deposit Boundary ($)</label>
                <Input 
                  type="number"
                  value={payForm.minDeposit}
                  onChange={e => setPayForm({ ...payForm, minDeposit: Number(e.target.value) })}
                  required
                  disabled={!canModifyPayments}
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Maximum Deposit Boundary ($)</label>
                <Input 
                  type="number"
                  value={payForm.maxDeposit}
                  onChange={e => setPayForm({ ...payForm, maxDeposit: Number(e.target.value) })}
                  required
                  disabled={!canModifyPayments}
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Withdrawal Settlement Processing Fee (%)</label>
                <Input 
                  type="number"
                  step="0.01"
                  value={payForm.withdrawalFeePercent}
                  onChange={e => setPayForm({ ...payForm, withdrawalFeePercent: Number(e.target.value) })}
                  required
                  disabled={!canModifyPayments}
                />
              </div>
            </CardContent>
          </Card>

          {canModifyPayments && (
            <div className="flex justify-end">
              <Button type="submit" className="gap-1.5 cursor-pointer font-bold text-xs shadow-md">
                <Save className="w-4 h-4" /> Save Settlement Configurations
              </Button>
            </div>
          )}
        </form>
      )}

      {/* 2. SECURITY EVENTS LIST */}
      {activeTab === 'security' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Card className="bg-panel border-border/80 overflow-hidden">
            <CardHeader className="pb-3 p-5">
              <CardTitle className="text-sm font-bold">Failed Login lockouts & Intrusion Anomaly Alerts</CardTitle>
              <CardDescription className="text-xs">Security events logs triggered by brute-force locks or suspicious geolocation coordinates.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground">Alert ID</th>
                      <th className="p-3 font-semibold text-muted-foreground">Event Type</th>
                      <th className="p-3 font-semibold text-muted-foreground">Target Email</th>
                      <th className="p-3 font-semibold text-muted-foreground">IP Location</th>
                      <th className="p-3 font-semibold text-muted-foreground">Terminal Details</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Alert Status</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {securityEvents.map(ev => (
                      <tr key={ev.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-bold text-foreground">{ev.id}</td>
                        <td className="p-3 text-foreground font-sans font-semibold flex items-center gap-1.5 text-bearish">
                          <AlertTriangle className="w-3.5 h-3.5 text-bearish shrink-0" />
                          {ev.event}
                        </td>
                        <td className="p-3 text-muted-foreground">{ev.userEmail}</td>
                        <td className="p-3 text-foreground">{ev.ipAddress}</td>
                        <td className="p-3 text-muted-foreground font-sans">{ev.device}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 text-[9px] rounded font-bold ${
                            ev.status === 'Verified' ? 'bg-bullish/15 text-bullish' : 'bg-bearish/15 text-bearish animate-pulse'
                          }`}>
                            {ev.status === 'Verified' ? 'Resolved' : 'Active Anomaly'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans">
                          {ev.status !== 'Verified' && (
                            <Button 
                              variant="outline" 
                              size="xs" 
                              onClick={() => handleResolveAlert(ev.id, ev.status)}
                              className="text-[10px] py-1 border-primary/20 hover:bg-primary/5 text-primary cursor-pointer bg-card"
                            >
                              Clear Lock
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. AUDIT LOGS SEARCH */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold">Security Operation Ledger Trails (SOC Audits)</CardTitle>
                <CardDescription className="text-xs">Database audit trail tracking all actions performed by staff nodes.</CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search logs, operators..." 
                  value={searchAudit}
                  onChange={e => setSearchAudit(e.target.value)}
                  className="pl-9 bg-card text-xs h-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground">Log ID</th>
                      <th className="p-3 font-semibold text-muted-foreground">Admin Operator</th>
                      <th className="p-3 font-semibold text-muted-foreground">Role</th>
                      <th className="p-3 font-semibold text-muted-foreground">Action Details</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    {filteredAudits.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground italic font-sans">
                          No audit trails matching criteria found.
                        </td>
                      </tr>
                    ) : (
                      filteredAudits.map(log => (
                        <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-bold text-foreground">{log.id}</td>
                          <td className="p-3 text-foreground font-sans font-semibold">{log.adminName}</td>
                          <td className="p-3 text-muted-foreground font-sans">
                            <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded text-[10px]">
                              {log.adminRole}
                            </span>
                          </td>
                          <td className="p-3 text-foreground font-sans max-w-sm whitespace-pre-wrap">{log.action}</td>
                          <td className="p-3 text-center text-muted-foreground font-sans text-[10px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. PLATFORM GENERAL SETTINGS (Notification and email templates) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSystemSettings} className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Branding variables */}
            <Card className="bg-panel border-border/80">
              <CardHeader className="pb-3 p-5">
                <CardTitle className="text-sm font-bold">Platform Branding & Basements</CardTitle>
                <CardDescription className="text-xs">Configure the site details and localization currencies.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Platform Brand Name</label>
                  <Input 
                    value={sysForm.platformName}
                    onChange={e => setSysForm({ ...sysForm, platformName: e.target.value })}
                    required
                    disabled={!canModifySettings}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Logo Header text</label>
                  <Input 
                    value={sysForm.logoText}
                    onChange={e => setSysForm({ ...sysForm, logoText: e.target.value })}
                    required
                    disabled={!canModifySettings}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold block">Baseline Currency</label>
                    <Input 
                      value={sysForm.baseCurrency}
                      onChange={e => setSysForm({ ...sysForm, baseCurrency: e.target.value })}
                      required
                      disabled={!canModifySettings}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold block">USD Clearing Multiplier</label>
                    <Input 
                      type="number"
                      step="0.0001"
                      value={sysForm.exchangeRateUSD}
                      onChange={e => setSysForm({ ...sysForm, exchangeRateUSD: Number(e.target.value) })}
                      required
                      disabled={!canModifySettings}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email Templates forms */}
            <Card className="bg-panel border-border/80">
              <CardHeader className="pb-3 p-5">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Automated Dispatch Emails (SMTP)
                </CardTitle>
                <CardDescription className="text-xs">Configure email templates for customer verification nodes.</CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Welcome Registration template</label>
                  <textarea 
                    value={sysForm.emailTemplateWelcome}
                    onChange={e => setSysForm({ ...sysForm, emailTemplateWelcome: e.target.value })}
                    rows={2}
                    required
                    disabled={!canModifySettings}
                    className="w-full bg-card border border-border rounded p-2 text-xs text-foreground outline-none resize-none focus:border-primary/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">KYC Verification Cleared template</label>
                  <textarea 
                    value={sysForm.emailTemplateKycApproved}
                    onChange={e => setSysForm({ ...sysForm, emailTemplateKycApproved: e.target.value })}
                    rows={2}
                    required
                    disabled={!canModifySettings}
                    className="w-full bg-card border border-border rounded p-2 text-xs text-foreground outline-none resize-none focus:border-primary/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Deposit success credit template</label>
                  <textarea 
                    value={sysForm.emailTemplateDepositSuccess}
                    onChange={e => setSysForm({ ...sysForm, emailTemplateDepositSuccess: e.target.value })}
                    rows={2}
                    required
                    disabled={!canModifySettings}
                    className="w-full bg-card border border-border rounded p-2 text-xs text-foreground outline-none resize-none focus:border-primary/50 font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SMS Alert templates */}
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" /> Gateway SMS Alerts (Twilio)
              </CardTitle>
              <CardDescription className="text-xs">Basement settings for cellular text templates.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-1 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Brute login security warning SMS</label>
                <textarea 
                  value={sysForm.smsTemplateAlert}
                  onChange={e => setSysForm({ ...sysForm, smsTemplateAlert: e.target.value })}
                  rows={2}
                  required
                  disabled={!canModifySettings}
                  className="w-full bg-card border border-border rounded p-2 text-xs text-foreground outline-none resize-none focus:border-primary/50 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          {canModifySettings && (
            <div className="flex justify-end">
              <Button type="submit" className="gap-1.5 cursor-pointer font-bold text-xs shadow-md">
                <Save className="w-4 h-4" /> Save platform configurations
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
