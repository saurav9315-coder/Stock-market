import React, { useState } from 'react';
import { UserSettings } from '@/lib/profileMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  ShieldAlert, 
  Smartphone, 
  Fingerprint, 
  Check, 
  X, 
  Copy, 
  Lock,
  LockKeyhole
} from 'lucide-react';
import { toast } from 'sonner';

interface SecuritySettingsTabProps {
  settings: UserSettings;
  onUpdateSecuritySettings: (updated: Partial<UserSettings>) => void;
}

export default function SecuritySettingsTab({
  settings,
  onUpdateSecuritySettings
}: SecuritySettingsTabProps) {
  // Password inputs
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Pin & Payout password inputs
  const [txnPin, setTxnPin] = useState<string>('');
  const [withdrawPass, setWithdrawPass] = useState<string>('');
  
  // 2FA modal configuration
  const [is2FaOpen, setIs2FaOpen] = useState<boolean>(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation password mismatch.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    toast.success("Security credentials updated! Please verify dynamic MFA next.");
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txnPin.length !== 4) {
      toast.error("Transaction PIN must be a 4-digit code.");
      return;
    }
    toast.success(`Transaction PIN set successfully: ${txnPin}`);
    setTxnPin('');
  };

  const handleWithdrawPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawPass.length < 6) {
      toast.error("Withdrawal password must be at least 6 characters.");
      return;
    }
    toast.success("Withdrawal authorization password established.");
    setWithdrawPass('');
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText("KVKG W3SZ J5XD O63V");
    setCopiedKey(true);
    toast.success("MFA authentication seed key copied.");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleToggle2FA = () => {
    if (settings.twoFactorEnabled) {
      // Prompt to disable
      onUpdateSecuritySettings({ twoFactorEnabled: false });
      toast.success("Google Authenticator MFA disabled.");
    } else {
      // Open configure dialog
      setTwoFactorCode('');
      setIs2FaOpen(true);
    }
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length === 6) {
      onUpdateSecuritySettings({ twoFactorEnabled: true });
      setIs2FaOpen(false);
      toast.success("Google Authenticator MFA verified & active!");
    } else {
      toast.error("Code must be 6 digits.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
      {/* 2FA, Biometrics, Login Alerts (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Toggle Switches */}
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Advanced Security Options</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Control two-factor protocols and biometrics configurations.</p>
          </div>

          <div className="space-y-4">
            {/* 2FA switch */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-indigo-400" /> Authenticator 2FA</span>
                <span className="text-[10px] text-muted-foreground block leading-relaxed">
                  Requires 6-digit dynamic authentication codes during logs or payouts.
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                  settings.twoFactorEnabled ? 'bg-primary' : 'bg-muted border border-border'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                  settings.twoFactorEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Biometric switch */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5"><Fingerprint className="w-4 h-4 text-indigo-400" /> Biometric Authentication (UI Ready)</span>
                <span className="text-[10px] text-muted-foreground block leading-relaxed">
                  Unlock client dashboards instantly using FaceID or TouchID.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateSecuritySettings({ biometricEnabled: !settings.biometricEnabled });
                  toast.success(settings.biometricEnabled ? "Biometrics link removed." : "Biometrics setup initiated. Hardware match pending.");
                }}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                  settings.biometricEnabled ? 'bg-primary' : 'bg-muted border border-border'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                  settings.biometricEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Login Alerts switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-indigo-400" /> Login Alerts Notifications</span>
                <span className="text-[10px] text-muted-foreground block leading-relaxed">
                  Triggers real-time alerts if logs from new browser nodes are audited.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateSecuritySettings({ loginAlertsEnabled: !settings.loginAlertsEnabled });
                  toast.success(settings.loginAlertsEnabled ? "Login alerts disabled." : "Login alerts activated.");
                }}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                  settings.loginAlertsEnabled ? 'bg-primary' : 'bg-muted border border-border'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                  settings.loginAlertsEnabled ? 'translate-x-4.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handlePasswordSubmit} className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Key className="w-4 h-4 text-primary" /> Modify Profile Password</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Maintain security by changing your credentials regularly.</p>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="oldPass" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Current Password</label>
              <input
                id="oldPass"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="newPass" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">New Password</label>
                <input
                  id="newPass"
                  type="password"
                  placeholder="Min 8 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPass" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">Confirm New Password</label>
                <input
                  id="confirmPass"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Update Profile Password
          </button>
        </form>
      </div>

      {/* Transaction PIN & Withdrawal Password (Right Column) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Transaction PIN Form */}
        <form onSubmit={handlePinSubmit} className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><LockKeyhole className="w-4 h-4 text-indigo-400" /> Transaction Security PIN</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Used to authorize mock withdrawals and trading allocations.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="txnPin" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono block">
                Set 4-Digit Security PIN
              </label>
              <input
                id="txnPin"
                type="password"
                maxLength={4}
                placeholder="• • • •"
                value={txnPin}
                onChange={(e) => setTxnPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-center text-lg rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono tracking-widest"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Set Transaction PIN
          </button>
        </form>

        {/* Withdrawal Password Form */}
        <form onSubmit={handleWithdrawPassSubmit} className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Lock className="w-4 h-4 text-indigo-400" /> Payout Withdrawal Password</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Secondary passcode requested before confirming transfers.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="withdrawPass" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono block">
                Withdrawal Password
              </label>
              <input
                id="withdrawPass"
                type="password"
                placeholder="Min 6 characters"
                value={withdrawPass}
                onChange={(e) => setWithdrawPass(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Set Withdrawal Password
          </button>
        </form>
      </div>

      {/* Google Authenticator configuration Modal Overlay */}
      <AnimatePresence>
        {is2FaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIs2FaOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-5 text-center">
                <div>
                  <h4 className="text-base font-bold text-foreground">Configure 2FA Authenticator</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[320px] mx-auto leading-relaxed">
                    Scan this QR code using Google Authenticator or Microsoft Authenticator.
                  </p>
                </div>

                {/* QR code vector */}
                <div className="flex flex-col items-center justify-center p-3 bg-panel/30 border border-border/20 rounded-lg max-w-[180px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="130" height="130" style={{ background: '#0b0f19', padding: '6px', borderRadius: '6px' }}>
                    <rect width="100" height="100" fill="#0b0f19" />
                    <rect x="5" y="5" width="25" height="25" fill="#6366f1" rx="2" />
                    <rect x="9" y="9" width="17" height="17" fill="#0b0f19" />
                    <rect x="13" y="13" width="9" height="9" fill="#6366f1" rx="1" />
                    <rect x="70" y="5" width="25" height="25" fill="#6366f1" rx="2" />
                    <rect x="74" y="9" width="17" height="17" fill="#0b0f19" />
                    <rect x="78" y="13" width="9" height="9" fill="#6366f1" rx="1" />
                    <rect x="5" y="70" width="25" height="25" fill="#6366f1" rx="2" />
                    <rect x="9" y="74" width="17" height="17" fill="#0b0f19" />
                    <rect x="13" y="78" width="9" height="9" fill="#6366f1" rx="1" />
                    <rect x="40" y="5" width="20" height="10" fill="#10b981" rx="1" />
                    <rect x="45" y="20" width="10" height="15" fill="#6366f1" rx="1" />
                    <rect x="35" y="45" width="15" height="15" fill="#10b981" rx="2" />
                    <rect x="70" y="45" width="15" height="15" fill="#6366f1" rx="2" />
                    <rect x="40" y="70" width="10" height="25" fill="#10b981" rx="1" />
                    <rect x="55" y="70" width="25" height="10" fill="#6366f1" rx="1" />
                  </svg>
                </div>

                {/* Secret Key display */}
                <div className="space-y-1.5 text-left max-w-xs mx-auto">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider block text-center">
                    MFA Secret Setup Seed
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-panel border border-border rounded-lg text-xs font-mono">
                    <span className="text-foreground font-semibold">KVKG W3SZ J5XD O63V</span>
                    <button
                      type="button"
                      onClick={copySecretKey}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded cursor-pointer transition-colors"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConfirm2FA} className="space-y-3.5 text-left pt-2">
                  <div className="space-y-1.5">
                    <label htmlFor="codeMfa" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono block text-center">
                      Confirm Authenticator 6-Digit Code
                    </label>
                    <input
                      id="codeMfa"
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 text-center text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono tracking-wider"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Confirm & Activate 2FA
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
