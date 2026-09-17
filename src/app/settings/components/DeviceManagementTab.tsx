import React from 'react';
import { DeviceSession } from '@/lib/profileMock';
import { Laptop, Smartphone, Monitor, ShieldCheck, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceManagementTabProps {
  devices: DeviceSession[];
  onLogoutDevice: (id: string) => void;
  onLogoutAllDevices: () => void;
}

export default function DeviceManagementTab({
  devices,
  onLogoutDevice,
  onLogoutAllDevices
}: DeviceManagementTabProps) {
  const getDeviceIcon = (os: string) => {
    const cleanOs = os.toLowerCase();
    if (cleanOs.includes('ios') || cleanOs.includes('android') || cleanOs.includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-indigo-400" />;
    }
    if (cleanOs.includes('mac') || cleanOs.includes('windows') || cleanOs.includes('linux')) {
      return <Laptop className="w-5 h-5 text-indigo-400" />;
    }
    return <Monitor className="w-5 h-5 text-indigo-400" />;
  };

  const handleLogoutAll = () => {
    onLogoutAllDevices();
    toast.success("All other active device sessions terminated.");
  };

  return (
    <div className="rounded-xl border border-panel-border bg-card p-6 space-y-6 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Active Session Auditor</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit hardware nodes and browsers authorized to access this sandbox profile.
          </p>
        </div>
        
        {devices.length > 1 && (
          <button
            onClick={handleLogoutAll}
            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] font-mono rounded border border-rose-500/20 cursor-pointer transition-colors"
          >
            TERMINATE OTHER SESSIONS
          </button>
        )}
      </div>

      <div className="divide-y divide-border/30">
        {devices.map((session) => (
          <div key={session.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-panel border border-border">
                {getDeviceIcon(session.os)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{session.deviceName}</span>
                  {session.current && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      CURRENT SESSION
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono space-y-0.5">
                  <p>{session.browser} • {session.os}</p>
                  <p>IP Address: {session.ipAddress} • Logged: {new Date(session.loginTime).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {!session.current && (
              <button
                onClick={() => {
                  onLogoutDevice(session.id);
                  toast.success(`Session on ${session.deviceName} revoked.`);
                }}
                className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                title="Revoke session key"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
