'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  Download, 
  Fingerprint,
  CheckCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { SecurityDatabase } from '@/lib/securityMock';
import { UserSettings } from '@/lib/profileMock';

// Vector QR Code representation
const qrCodeSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="150" height="150" style="background:%230f172a;padding:8px;border-radius:8px;"><rect width="100%" height="100%" fill="%230f172a"/><rect x="8" y="8" width="24" height="24" fill="%236366f1" rx="2"/><rect x="12" y="12" width="16" height="16" fill="%230f172a"/><rect x="15" y="15" width="10" height="10" fill="%236366f1" rx="1"/><rect x="68" y="8" width="24" height="24" fill="%236366f1" rx="2"/><rect x="72" y="12" width="16" height="16" fill="%230f172a"/><rect x="75" y="15" width="10" height="10" fill="%236366f1" rx="1"/><rect x="8" y="68" width="24" height="24" fill="%236366f1" rx="2"/><rect x="12" y="72" width="16" height="16" fill="%230f172a"/><rect x="15" y="75" width="10" height="10" fill="%236366f1" rx="1"/><rect x="40" y="8" width="16" height="8" fill="%2310b981" rx="1"/><rect x="40" y="24" width="8" height="10" fill="%236366f1" rx="1"/><rect x="8" y="40" width="8" height="16" fill="%2310b981" rx="1"/><rect x="24" y="40" width="10" height="8" fill="%236366f1" rx="1"/><circle cx="50" cy="50" r="4" fill="%2310b981"/></svg>`;

interface AccessControlProps {
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
  logAction: (action: string) => void;
}

export default function AccessControl({
  settings,
  onUpdateSettings,
  logAction
}: AccessControlProps) {
  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // PIN States
  const [txPin, setTxPin] = useState(SecurityDatabase.getTransactionPin());
  const [newTxPin, setNewTxPin] = useState('');
  
  const [wdPin, setWdPin] = useState(SecurityDatabase.getWithdrawalPin());
  const [newWdPin, setNewWdPin] = useState('');

  // 2FA Wizard States
  const [is2faWizardOpen, setIs2faWizardOpen] = useState(false);
  const [selectedAuthenticator, setSelectedAuthenticator] = useState<'google' | 'microsoft' | 'authy'>('google');
  const [otpCode, setOtpCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorSecret] = useState('AQXQ JBSW Y3DP EHPK 3PXP');

  // Timeout settings
  const [timeoutMins, setTimeoutMins] = useState(SecurityDatabase.getSessionTimeoutMinutes());

  // Copy helpers
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret.replace(/\s+/g, ''));
    setCopiedSecret(true);
    toast.success('Authenticator secret copied');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters long');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    logAction('Modified user account login password credentials.');
    toast.success('Password updated successfully');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSaveTxPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTxPin.length !== 4 || isNaN(Number(newTxPin))) {
      return toast.error('Transaction PIN must be exactly 4 digits');
    }
    SecurityDatabase.setTransactionPin(newTxPin);
    setTxPin(newTxPin);
    logAction('Configured 4-digit Transaction authorization PIN.');
    toast.success('Transaction PIN successfully updated');
    setNewTxPin('');
  };

  const handleSaveWdPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWdPin.length !== 4 || isNaN(Number(newWdPin))) {
      return toast.error('Withdrawal PIN must be exactly 4 digits');
    }
    SecurityDatabase.setWithdrawalPin(newWdPin);
    setWdPin(newWdPin);
    logAction('Configured 4-digit Cash Withdrawal clearing PIN.');
    toast.success('Withdrawal PIN successfully updated');
    setNewWdPin('');
  };

  const handleTimeoutChange = (mins: number) => {
    setTimeoutMins(mins);
    SecurityDatabase.setSessionTimeoutMinutes(mins);
    logAction(`Configured account session automatic lockout timeout to: ${mins} minutes`);
    toast.success(`Session timeout updated to ${mins} minutes`);
  };

  // Start 2FA setup
  const handleStart2faSetup = () => {
    setIs2faWizardOpen(true);
    setOtpCode('');
    setBackupCodes([]);
  };

  // Complete 2FA setup
  const handleVerify2faSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6 || isNaN(Number(otpCode))) {
      return toast.error('Verification code must be exactly 6 digits');
    }

    // Generate mock backup codes
    const codes = Array.from({ length: 8 }, () => 
      `${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`
    );
    setBackupCodes(codes);

    // Save to profilemock settings
    onUpdateSettings({ twoFactorEnabled: true });
    logAction(`Configured two-factor OTP credentials with ${selectedAuthenticator.toUpperCase()} node.`);
    toast.success('Two-factor OTP verified and enabled');
  };

  const downloadBackupCodes = () => {
    const textContent = `
==================================================
STOCKINSIDE TRADING - 2FA BACKUP RECOVERY CODES
==================================================
Date Generated: ${new Date().toLocaleString()}
Secure Account: User Node
--------------------------------------------------
Use the codes below to authenticate if you lose 
access to your authenticator token. Each code 
can only be utilized once.
--------------------------------------------------
${backupCodes.map((c, i) => `Code [${i + 1}]: ${c}`).join('\n')}
==================================================
`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StockInside_Trading_2FA_Backup_Codes.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('Downloaded Two-Factor authentication backup recovery codes file.');
    toast.success('Backup codes file downloaded');
  };

  const handleDisable2fa = () => {
    if (confirm('CRITICAL WARNING: Disabling Two-Factor authentication reduces your overall Security Score and leaves your account vulnerable. Proceed?')) {
      onUpdateSettings({ twoFactorEnabled: false });
      logAction('Disabled Two-Factor OTP protection clearance.');
      toast.warning('Two-factor OTP authentication is now disabled');
    }
  };

  return (
    <div className="space-y-6">
      {/* 2FA Card Setup */}
      <Card className="bg-panel border-border/80 relative overflow-hidden group">
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${settings.twoFactorEnabled ? 'bg-bullish' : 'bg-bearish animate-pulse'}`} />
        <CardHeader className="pb-3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-primary" /> Two-Factor Authentication (2FA)
            </CardTitle>
            <CardDescription className="text-xs">Secure transactions and withdrawals with secondary OTP security keycodes.</CardDescription>
          </div>
          <div className="shrink-0 text-right">
            {settings.twoFactorEnabled ? (
              <Badge className="bg-bullish/15 text-bullish border-bullish/30 text-[9px] py-0.5 uppercase tracking-wider font-bold">ACTIVE PROTECTED</Badge>
            ) : (
              <Badge className="bg-bearish/15 text-bearish border-bearish/30 text-[9px] py-0.5 uppercase tracking-wider font-bold">ACTION REQUIRED</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium">
          <div className="text-muted-foreground max-w-xl">
            {settings.twoFactorEnabled 
              ? 'Account protected. Two-factor authentication dispatches code challenges to your authenticator application for logins and payouts.'
              : 'Add an extra layer of protection. When signing in or clearing withdrawals, you will enter a code from your mobile authenticator.'}
          </div>
          <div className="shrink-0">
            {settings.twoFactorEnabled ? (
              <Button variant="outline" size="sm" onClick={handleDisable2fa} className="text-bearish hover:bg-bearish/10 border-bearish/30 cursor-pointer bg-card text-xs">
                Deactivate 2FA
              </Button>
            ) : (
              <Button size="sm" onClick={handleStart2faSetup} className="cursor-pointer text-xs font-bold font-sans">
                Setup OTP 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change password */}
        <Card className="bg-panel border-border/80">
          <CardHeader className="pb-3 p-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> Rotate Account Password
            </CardTitle>
            <CardDescription className="text-xs">Rotate credentials regularly to maintain clearance safety.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Current Password</label>
                <div className="relative">
                  <Input 
                    type={showPw ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    className="bg-card text-xs"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">New Quant Password</label>
                <Input 
                  type={showPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="bg-card text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Confirm New Password</label>
                <Input 
                  type={showPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="bg-card text-xs"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold">
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* PINs configuration */}
        <div className="space-y-6">
          {/* Transaction PIN */}
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Setup Transaction PIN (4-Digits)
              </CardTitle>
              <CardDescription className="text-xs">PIN required to verify trading orders executions.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form onSubmit={handleSaveTxPin} className="flex items-end gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    {txPin ? 'Change PIN code (Active)' : 'Create PIN code (Offline)'}
                  </label>
                  <Input 
                    type="password"
                    maxLength={4}
                    value={newTxPin}
                    onChange={e => setNewTxPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                    className="bg-card font-mono text-center tracking-widest text-xs"
                  />
                </div>
                <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold">
                  Save PIN
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Withdrawal PIN */}
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 p-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" /> Setup Withdrawal PIN (4-Digits)
              </CardTitle>
              <CardDescription className="text-xs">PIN required to clear checkout payouts.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <form onSubmit={handleSaveWdPin} className="flex items-end gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <label className="text-muted-foreground font-semibold">
                    {wdPin ? 'Change Payout PIN (Active)' : 'Create Payout PIN (Offline)'}
                  </label>
                  <Input 
                    type="password"
                    maxLength={4}
                    value={newWdPin}
                    onChange={e => setNewWdPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    required
                    className="bg-card font-mono text-center tracking-widest text-xs"
                  />
                </div>
                <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold">
                  Save PIN
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Lockout & Passkey hardware switches */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" /> Session Locks & Biometrics Passkeys
          </CardTitle>
          <CardDescription className="text-xs">Configure inactive lockout timeouts and hardware credential authentication.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Session Timeout */}
            <div className="space-y-1">
              <label className="text-muted-foreground font-semibold block mb-1">Session Inactivity Lockout</label>
              <select 
                value={timeoutMins}
                onChange={e => handleTimeoutChange(Number(e.target.value))}
                className="bg-card border border-border rounded px-2.5 py-2 text-xs text-foreground outline-none cursor-pointer w-full"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={240}>4 Hours</option>
              </select>
            </div>

            {/* Passkeys toggle */}
            <div className="flex items-center justify-between border border-border rounded p-3 bg-card/40">
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block">FIDO Passkeys</span>
                <span className="text-[10px] text-muted-foreground block">Login via secure hardware key</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.pushNotif} // mapping to existing settings variables
                onChange={e => {
                  onUpdateSettings({ pushNotif: e.target.checked });
                  logAction(e.target.checked ? 'Enabled hardware FIDO Passkeys login.' : 'Disabled hardware FIDO Passkeys login.');
                  toast.success(e.target.checked ? 'Passkeys configuration activated' : 'Passkeys deactivated');
                }}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
            </div>

            {/* Biometric login */}
            <div className="flex items-center justify-between border border-border rounded p-3 bg-card/40">
              <div className="space-y-0.5">
                <span className="text-foreground font-bold block">Biometric Fingerprint</span>
                <span className="text-[10px] text-muted-foreground block">Webauthn fingerprint checks</span>
              </div>
              <input 
                type="checkbox"
                checked={settings.biometricEnabled}
                onChange={e => {
                  onUpdateSettings({ biometricEnabled: e.target.checked });
                  logAction(e.target.checked ? 'Enabled biometric Webauthn fingerprint authorization.' : 'Disabled biometric Webauthn fingerprint authorization.');
                  toast.success(e.target.checked ? 'Biometric verification active' : 'Biometrics deactivated');
                }}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA SETUP WIZARD DIALOG */}
      {is2faWizardOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Setup Authenticator 2FA</h3>
              <button 
                onClick={() => setIs2faWizardOpen(false)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto scrollbar-thin space-y-5 text-xs leading-relaxed">
              {backupCodes.length === 0 ? (
                <>
                  {/* Step 1: Select app */}
                  <div className="space-y-2">
                    <span className="font-bold text-foreground block">Step 1: Choose Authenticator Client</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['google', 'microsoft', 'authy'] as const).map(app => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setSelectedAuthenticator(app)}
                          className={`p-2 border rounded text-[11px] font-bold cursor-pointer text-center capitalize hover:bg-muted/80 transition-colors ${
                            selectedAuthenticator === app ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'
                          }`}
                        >
                          {app === 'authy' ? 'Authy' : `${app}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Scan QR */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <span className="font-bold text-foreground block">Step 2: Scan QR or Enter Manual Secret Key</span>
                    <p className="text-muted-foreground">
                      Open your authenticator app, scan the code matrices below, or key in the secret key manually.
                    </p>
                    <div className="flex items-center gap-4 bg-muted/20 border border-border/80 rounded p-3">
                      <div className="shrink-0 bg-white rounded p-1 border border-border shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCodeSvg} alt="Scan QR" className="w-24 h-24" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Secret Account Key</span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-foreground font-semibold select-all">
                          {twoFactorSecret}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="xs" 
                          onClick={handleCopySecret}
                          className="text-[10px] gap-1 px-2 py-1 cursor-pointer hover:bg-muted font-bold text-primary mt-1"
                        >
                          {copiedSecret ? <Check className="w-3 h-3 text-bullish" /> : <Copy className="w-3 h-3" />}
                          Copy Key
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Enter OTP */}
                  <form onSubmit={handleVerify2faSetup} className="space-y-3 pt-3 border-t border-border">
                    <span className="font-bold text-foreground block">Step 3: Enter OTP Verification Challenge</span>
                    <p className="text-muted-foreground">
                      Key in the 6-digit code challenge generated inside your client app.
                    </p>
                    <div className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <Input 
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          required
                          className="bg-card font-mono text-center tracking-widest text-xs"
                        />
                      </div>
                      <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold">
                        Verify Code
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                /* Success codes download */
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-bullish/10 border border-bullish/20 text-bullish flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Two-Factor Authenticator Setup Completed</h4>
                  <p className="text-muted-foreground text-left leading-relaxed">
                    Save these backup recovery codes. If you lose access to your mobile authenticator client, you can enter these recovery keys once per login.
                  </p>
                  
                  {/* Backup codes list */}
                  <div className="grid grid-cols-2 gap-2 text-left bg-muted border border-border p-3 rounded font-mono font-bold text-[11px] text-foreground select-all">
                    {backupCodes.map((code, idx) => (
                      <div key={idx} className="flex justify-between border-b border-border/40 pb-1">
                        <span className="text-muted-foreground">[{idx+1}]</span>
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={downloadBackupCodes} 
                      className="gap-1.5 cursor-pointer text-xs font-semibold"
                    >
                      <Download className="w-4 h-4" /> Download Backup Codes (.txt)
                    </Button>
                    <Button 
                      onClick={() => setIs2faWizardOpen(false)}
                      className="cursor-pointer text-xs font-bold text-white bg-primary shadow"
                    >
                      Done Setup
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
