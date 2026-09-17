import React from 'react';
import { UserSettings } from '@/lib/profileMock';
import { Mail, Bell, Smartphone, MessageSquare, Send, Sparkles, TrendingUp, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationsTabProps {
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
}

export default function NotificationsTab({
  settings,
  onUpdateSettings
}: NotificationsTabProps) {

  const toggleSetting = (key: keyof UserSettings, label: string) => {
    onUpdateSettings({ [key]: !settings[key] });
    toast.success(`${label} status updated.`);
  };

  const notificationChannels = [
    { key: 'emailNotif', label: 'Email Notifications', desc: 'Wired to profile credentials address.', icon: Mail },
    { key: 'pushNotif', label: 'Push Notifications', desc: 'Direct updates triggered inside browser panels.', icon: Bell },
    { key: 'smsNotif', label: 'SMS Notifications (UI Ready)', desc: 'Mobile network text triggers.', icon: Smartphone, uiOnly: true },
    { key: 'whatsappNotif', label: 'WhatsApp Updates (UI Ready)', desc: 'Platform alerts sent to WhatsApp.', icon: MessageSquare, uiOnly: true },
    { key: 'telegramNotif', label: 'Telegram Alerts', desc: 'Secure indicators pushed via Telegram Bot.', icon: Send }
  ];

  const notificationTopics = [
    { key: 'aiAlerts', label: 'AI Anomaly & Indicators Alerts', desc: 'Trigger alerts when neural indicators identify anomalies.', icon: Sparkles },
    { key: 'marketAlerts', label: 'Market Volatility Alerts', desc: 'Updates when tracked ticker volatility breaches 3.5%.', icon: TrendingUp },
    { key: 'portfolioAlerts', label: 'Portfolio Weights Rebalance Alerts', desc: 'Alerts if sector weight thresholds deviate from targets.', icon: Briefcase }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Channels Card */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">Communication Delivery Channels</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Configure preferred channels to receive critical account reports.</p>
        </div>

        <div className="space-y-4">
          {notificationChannels.map((channel) => {
            const Icon = channel.icon;
            const isChecked = settings[channel.key as keyof UserSettings] as boolean;
            return (
              <div key={channel.key} className="flex items-center justify-between pb-3 border-b border-border/30 last:pb-0 last:border-b-0">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    {channel.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground block leading-relaxed">{channel.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting(channel.key as any, channel.label)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                    isChecked ? 'bg-primary' : 'bg-muted border border-border'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                    isChecked ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topics Card */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground">Topic Alert Subscriptions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Toggle alert parameters matching your quantitative trading thresholds.</p>
        </div>

        <div className="space-y-4">
          {notificationTopics.map((topic) => {
            const Icon = topic.icon;
            const isChecked = settings[topic.key as keyof UserSettings] as boolean;
            return (
              <div key={topic.key} className="flex items-center justify-between pb-3 border-b border-border/30 last:pb-0 last:border-b-0">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    {topic.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground block leading-relaxed">{topic.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSetting(topic.key as any, topic.label)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-all cursor-pointer relative shrink-0 ${
                    isChecked ? 'bg-primary' : 'bg-muted border border-border'
                  }`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all ${
                    isChecked ? 'translate-x-4.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
