import React, { useState } from 'react';
import { UserProfile, UserSettings } from '@/lib/profileMock';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, EyeOff, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacyTabProps {
  profile: UserProfile;
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
}

export default function PrivacyTab({
  profile,
  settings,
  onUpdateSettings
}: PrivacyTabProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [passConfirm, setPassConfirm] = useState<string>('');

  const triggerDownloadData = () => {
    toast.info("Compiling personal ledger registry packages...");
    const dataStr = JSON.stringify({ profile, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `Personal_Data_Audit_${profile.userId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("GDPR Personal Data package downloaded successfully.");
  };

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (passConfirm.length >= 6) {
      setIsDeleteOpen(false);
      setPassConfirm('');
      toast.warning("Compliance ticket for profile deletion submitted. Account deactivated in 14 days.");
    } else {
      toast.error("Password must be at least 6 characters.");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Privacy Controls Card */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">Opt-Out & Advertising Preferences</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Control data telemetry sharing parameters.</p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Telemetry toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-border/30">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5"><EyeOff className="w-4 h-4 text-indigo-400" /> Share Telemetry Data</span>
              <span className="text-[10px] text-muted-foreground block leading-relaxed">
                Allow sharing anonymized metrics reports to optimize stochastic feed engines.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ privacyTelemetry: !settings.privacyTelemetry });
                toast.success("Telemetry preferences updated.");
              }}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                settings.privacyTelemetry ? 'bg-primary' : 'bg-muted border border-border'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                settings.privacyTelemetry ? 'translate-x-4.5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Leaderboard toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-4">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5"><EyeOff className="w-4 h-4 text-indigo-400" /> Display on Leaderboards</span>
              <span className="text-[10px] text-muted-foreground block leading-relaxed">
                Render username on simulated trading mock competitions lists.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ privacyLeaderboard: !settings.privacyLeaderboard });
                toast.success("Leaderboard visibility updated.");
              }}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                settings.privacyLeaderboard ? 'bg-primary' : 'bg-muted border border-border'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                settings.privacyLeaderboard ? 'translate-x-4.5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Data Deletion / GDPR Panel */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">Compliance & GDPR Requests</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Exercise your right to data erasure or export.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          <button
            onClick={triggerDownloadData}
            className="flex-1 py-2.5 px-4 border border-border bg-panel hover:bg-muted text-foreground font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-primary" />
            Download GDPR Data Log
          </button>

          <button
            onClick={() => { setPassConfirm(''); setIsDeleteOpen(true); }}
            className="flex-1 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            Request Profile Deletion
          </button>
        </div>
      </div>

      {/* Delete Account confirmation Drawer */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative text-center"
            >
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">Confirm Profile Deletion</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto leading-relaxed text-center">
                    Warning! This action is irreversible. All indicators histories, wallet ledgers, and transactions logs will be deleted.
                  </p>
                </div>

                <form onSubmit={handleDeleteRequest} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label htmlFor="delPass" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono block text-center">
                      Confirm Account Password
                    </label>
                    <input
                      id="delPass"
                      type="password"
                      placeholder="••••••••"
                      value={passConfirm}
                      onChange={(e) => setPassConfirm(e.target.value)}
                      className="w-full px-3 py-2 text-center text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteOpen(false)}
                      className="w-1/2 py-2 bg-secondary hover:bg-muted text-foreground font-bold text-xs rounded-lg border border-border cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2 bg-rose-500 hover:bg-rose-500/90 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
