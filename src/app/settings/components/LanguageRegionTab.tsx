import React from 'react';
import { UserSettings } from '@/lib/profileMock';
import { Globe, DollarSign, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface LanguageRegionTabProps {
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
}

export default function LanguageRegionTab({
  settings,
  onUpdateSettings
}: LanguageRegionTabProps) {

  const handleSelectChange = (key: keyof UserSettings, value: string) => {
    onUpdateSettings({ [key]: value });
    toast.success(`Regional configurations updated.`);
  };

  return (
    <div className="rounded-xl border border-panel-border bg-card p-6 space-y-6 shadow-sm text-left">
      <div>
        <h3 className="text-sm font-bold text-foreground">Language & Regional Preferences</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Customize display translation, time offsets, and currency values.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Language */}
        <div className="space-y-1.5">
          <label htmlFor="lang" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Language
          </label>
          <select
            id="lang"
            value={settings.language}
            onChange={(e) => handleSelectChange('language', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option value="English (US)">English (US)</option>
            <option value="English (UK)">English (UK)</option>
            <option value="Hindi (हिंदी)">Hindi (हिंदी)</option>
            <option value="German (Deutsch)">German (Deutsch)</option>
            <option value="Spanish (Español)">Spanish (Español)</option>
          </select>
        </div>

        {/* Currency */}
        <div className="space-y-1.5">
          <label htmlFor="curr" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Preferred Currency
          </label>
          <select
            id="curr"
            value={settings.currency}
            onChange={(e) => handleSelectChange('currency', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option value="USD ($)">USD ($)</option>
            <option value="INR (₹)">INR (₹)</option>
            <option value="EUR (€)">EUR (€)</option>
            <option value="GBP (£)">GBP (£)</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="space-y-1.5">
          <label htmlFor="tz" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Time Zone
          </label>
          <select
            id="tz"
            value={settings.timezone}
            onChange={(e) => handleSelectChange('timezone', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option value="UTC -05:00 (New York)">UTC -05:00 (New York)</option>
            <option value="UTC +00:00 (London)">UTC +00:00 (London)</option>
            <option value="UTC +05:30 (Kolkata)">UTC +05:30 (Kolkata)</option>
            <option value="UTC +01:00 (Berlin)">UTC +01:00 (Berlin)</option>
          </select>
        </div>

        {/* Date format */}
        <div className="space-y-1.5">
          <label htmlFor="df" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Format
          </label>
          <select
            id="df"
            value={settings.dateFormat}
            onChange={(e) => handleSelectChange('dateFormat', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>
      </div>
    </div>
  );
}
