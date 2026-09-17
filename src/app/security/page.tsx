'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Laptop, 
  History, 
  Key, 
  Sliders, 
  ChevronDown,
  AlertOctagon
} from 'lucide-react';

// DB & Mocks
import { 
  UserProfile, 
  DeviceSession, 
  ApiKey, 
  Webhook, 
  UserSettings,
  loadProfile,
  loadDevices,
  saveDevices,
  loadApiKeys,
  saveApiKeys,
  loadWebhooks,
  saveWebhooks,
  loadSettings,
  saveSettings,
  loadActivityLogs,
  saveActivityLogs
} from '@/lib/profileMock';

import { 
  SecurityDatabase, 
  SecurityScoreCard, 
  SecurityEventLog, 
  FraudAlert,
  SecurityCheckItem
} from '@/lib/securityMock';

// UI Tabs
import SecurityOverview from './components/SecurityOverview';
import AccessControl from './components/AccessControl';
import SessionsDevices from './components/SessionsDevices';
import AuditsHistory from './components/AuditsHistory';
import ApiDeveloperDesk from './components/ApiDeveloperDesk';
import AntiFraudDesk from './components/AntiFraudDesk';
import PrivacySettings from './components/PrivacySettings';

export default function SecurityCenterPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [events, setEvents] = useState<SecurityEventLog[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);

  // Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfile(loadProfile());
      setSettings(loadSettings());
      setDevices(loadDevices());
      setApiKeys(loadApiKeys());
      setWebhooks(loadWebhooks());
      setEvents(SecurityDatabase.getSecurityEvents());
      setFraudAlerts(SecurityDatabase.getFraudAlerts());
      setIsLoading(false);
      setMounted(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Logger helper
  const logSecurityAction = (action: string, status: SecurityEventLog['status'] = 'Success') => {
    // 1. Log to Security History Events
    SecurityDatabase.logSecurityEvent(action, status);
    setEvents(SecurityDatabase.getSecurityEvents());

    // 2. Also log to standard profile activity logs for sync
    const activityLogs = loadActivityLogs();
    const newLog = {
      id: `log-${Date.now()}`,
      event: action,
      timestamp: new Date().toISOString(),
      device: "MacBook Pro (Chrome 122.0)",
      status: status === 'Success' ? 'Success' as const : status === 'Failed' ? 'Failed' as const : 'Info' as const
    };
    const updatedLogs = [newLog, ...activityLogs];
    saveActivityLogs(updatedLogs);
  };

  // Dynamic Score card calculation
  const scoreReport = useMemo(() => {
    if (!mounted || isLoading) return { score: 70, checklist: [] as SecurityCheckItem[] };
    return SecurityDatabase.calculateSecurityScore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoading, settings, devices, profile]);

  const scoreCard = useMemo<SecurityScoreCard>(() => {
    const activeAlerts = fraudAlerts.filter(a => !a.resolved).length;
    let status: SecurityScoreCard['protectionStatus'] = 'Secured';
    if (scoreReport.score < 60) status = 'Vulnerable';
    else if (scoreReport.score < 80 || activeAlerts > 0) status = 'Action Required';

    return {
      score: scoreReport.score,
      protectionStatus: status,
      lastLogin: events[0]?.timestamp || new Date().toISOString(),
      activeSessionsCount: devices.length,
      trustedDevicesCount: devices.filter(d => !d.current).length, // simple fallback
      failedLoginsCount: events.filter(e => e.status === 'Failed').length
    };
  }, [scoreReport, devices, events, fraudAlerts]);

  // ------------------------------------------
  // ACTIONS
  // ------------------------------------------
  const handleUpdateSettings = (updated: Partial<UserSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...updated };
    setSettings(next);
    saveSettings(next);
  };

  const handleLogoutDevice = (id: string) => {
    const updated = devices.filter(d => d.id !== id);
    setDevices(updated);
    saveDevices(updated);
    logSecurityAction('Terminated authorized active session terminal node.', 'Warning');
  };

  const handleLogoutAllDevices = () => {
    const current = devices.filter(d => d.current);
    setDevices(current);
    saveDevices(current);
    logSecurityAction('Revoked all other active session nodes.', 'Warning');
  };

  const handleAddApiKey = (key: Omit<ApiKey, 'id' | 'secret' | 'createdAt'>) => {
    const id = `ag_pk_${Math.floor(100000 + Math.random() * 900000).toString(16)}`;
    const secret = `ag_sk_••••••••••••••••${Math.floor(1000 + Math.random() * 9000).toString(16)}`;
    const newItem: ApiKey = {
      ...key,
      id,
      secret,
      createdAt: new Date().toISOString()
    };
    const updated = [...apiKeys, newItem];
    setApiKeys(updated);
    saveApiKeys(updated);
    logSecurityAction(`Generated new API Key Token: ${key.name}`);
  };

  const handleDeleteApiKey = (id: string) => {
    const key = apiKeys.find(k => k.id === id);
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    saveApiKeys(updated);
    logSecurityAction(`Revoked API Token Key: ${key?.name || id}`, 'Warning');
  };

  const handleAddWebhook = (hook: Omit<Webhook, 'id' | 'secret' | 'createdAt' | 'status'>) => {
    const id = `hook-${Date.now()}`;
    const secret = `whsec_${Math.random().toString(36).substring(7)}`;
    const newItem: Webhook = {
      ...hook,
      id,
      secret,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    const updated = [...webhooks, newItem];
    setWebhooks(updated);
    saveWebhooks(updated);
    logSecurityAction(`Registered outbound webhook target URL: ${hook.url}`);
  };

  const handleDeleteWebhook = (id: string) => {
    const hook = webhooks.find(h => h.id === id);
    const updated = webhooks.filter(h => h.id !== id);
    setWebhooks(updated);
    saveWebhooks(updated);
    logSecurityAction(`Deleted webhook target endpoint: ${hook?.url || id}`, 'Warning');
  };

  const handleToggleWebhook = (id: string) => {
    const updated = webhooks.map((h) => {
      if (h.id === id) {
        const nextStatus = h.status === 'Active' ? 'Inactive' as const : 'Active' as const;
        logSecurityAction(`Toggled webhook status ${h.url} to: ${nextStatus}`);
        return { ...h, status: nextStatus };
      }
      return h;
    });
    setWebhooks(updated);
    saveWebhooks(updated);
  };

  const handleResolveAlert = (id: string) => {
    const updated = fraudAlerts.map(a => a.id === id ? { ...a, resolved: true } : a);
    setFraudAlerts(updated);
    SecurityDatabase.setFraudAlerts(updated);
  };

  if (!mounted) return null;

  const tabs = [
    { id: 'overview', label: 'Security Dashboard', icon: ShieldCheck },
    { id: 'access', label: 'Access & 2FA Setup', icon: Lock },
    { id: 'sessions', label: 'Sessions & Devices', icon: Laptop },
    { id: 'audits', label: 'Audits & Scan logs', icon: History },
    { id: 'api', label: 'Developer API Keys', icon: Key },
    { id: 'fraud', label: 'Anti-Fraud Desk', icon: AlertOctagon },
    { id: 'privacy', label: 'Privacy & Limits', icon: Sliders }
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Overview';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen text-foreground pb-20">
      {/* Header */}
      <div className="border-b border-border/20 pb-5 text-left">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Enterprise Security Control Center</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Audit credentials configurations, active FIDO passkeys, geolocations access streams, and developer webhooks.
        </p>
      </div>

      {isLoading ? (
        // Skeleton loader grid
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse text-left">
          <div className="lg:col-span-3 space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-10 bg-panel/40 border border-border/20 rounded-lg" />
            ))}
          </div>
          <div className="lg:col-span-9 h-96 bg-panel/30 border border-border/20 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Desktop Left Menu */}
          <div className="hidden lg:block lg:col-span-3 space-y-1 bg-panel/20 p-2.5 rounded-xl border border-border/30">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold rounded-lg transition-all text-left cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-panel/40'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Selector Dropdown */}
          <div className="block lg:hidden relative">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full px-4 py-2.5 bg-panel border border-border rounded-lg text-xs font-bold text-foreground flex justify-between items-center cursor-pointer"
            >
              <span>{activeTabLabel}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute left-0 right-0 top-12 z-30 bg-card border border-border rounded-lg shadow-lg overflow-hidden divide-y divide-border/20"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                      className="w-full px-4 py-2 text-xs font-medium hover:bg-panel text-left block text-muted-foreground hover:text-foreground"
                    >
                      {tab.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panels Container */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <SecurityOverview 
                    scoreCard={scoreCard} 
                    checklist={scoreReport.checklist}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'access' && settings && (
                  <AccessControl 
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    logAction={logSecurityAction}
                  />
                )}

                {activeTab === 'sessions' && (
                  <SessionsDevices 
                    devices={devices}
                    onLogoutDevice={handleLogoutDevice}
                    onLogoutAllDevices={handleLogoutAllDevices}
                    logAction={logSecurityAction}
                  />
                )}

                {activeTab === 'audits' && (
                  <AuditsHistory 
                    eventLogs={events}
                    checklist={scoreReport.checklist}
                    onTriggerOptimizations={setActiveTab}
                    logAction={logSecurityAction}
                  />
                )}

                {activeTab === 'api' && (
                  <ApiDeveloperDesk 
                    apiKeys={apiKeys}
                    webhooks={webhooks}
                    onAddApiKey={handleAddApiKey}
                    onDeleteApiKey={handleDeleteApiKey}
                    onAddWebhook={handleAddWebhook}
                    onDeleteWebhook={handleDeleteWebhook}
                    onToggleWebhook={handleToggleWebhook}
                  />
                )}

                {activeTab === 'fraud' && (
                  <AntiFraudDesk 
                    alerts={fraudAlerts}
                    onResolveAlert={handleResolveAlert}
                    logAction={logSecurityAction}
                  />
                )}

                {activeTab === 'privacy' && settings && (
                  <PrivacySettings 
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    logAction={logSecurityAction}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
