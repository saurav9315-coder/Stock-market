'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Building2, 
  Bell, 
  Globe, 
  EyeOff, 
  Key, 
  History, 
  LifeBuoy,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

// Mock States & Persistence Helpers
import { 
  UserProfile, 
  DeviceSession, 
  ApiKey, 
  Webhook, 
  ActivityLog, 
  SupportTicket, 
  SupportMessage,
  UserSettings,
  loadProfile,
  saveProfile,
  loadDevices,
  saveDevices,
  loadApiKeys,
  saveApiKeys,
  loadWebhooks,
  saveWebhooks,
  loadActivityLogs,
  saveActivityLogs,
  loadTickets,
  saveTickets,
  loadSettings,
  saveSettings
} from '@/lib/profileMock';

import { 
  BankAccount, 
  loadBankAccounts, 
  saveBankAccounts,
  loadTransactions
} from '@/lib/walletMock';

// Tab Subcomponents
import ProfileOverviewTab from './components/ProfileOverviewTab';
import PersonalInfoTab from './components/PersonalInfoTab';
import KycVerificationTab from './components/KycVerificationTab';
import SecuritySettingsTab from './components/SecuritySettingsTab';
import DeviceManagementTab from './components/DeviceManagementTab';
import BankAccountsTab from './components/BankAccountsTab';
import NotificationsTab from './components/NotificationsTab';
import LanguageRegionTab from './components/LanguageRegionTab';
import PrivacyTab from './components/PrivacyTab';
import ApiAccessTab from './components/ApiAccessTab';
import ActivityLogTab from './components/ActivityLogTab';
import HelpSupportTab from './components/HelpSupportTab';

export default function SettingsPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    
    const timer = setTimeout(() => {
      setProfile(loadProfile());
      setDevices(loadDevices());
      setApiKeys(loadApiKeys());
      setWebhooks(loadWebhooks());
      setActivityLogs(loadActivityLogs());
      setTickets(loadTickets());
      setSettings(loadSettings());
      setBankAccounts(loadBankAccounts());
      setIsLoadingState(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // System notification logger
  const logSystemNotification = (title: string, desc: string) => {
    if (typeof window === 'undefined') return;
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      description: desc,
      time: 'Just now',
      priority: 'medium' as const,
      read: false,
      category: 'system' as const
    };
    const saved = localStorage.getItem('triggered_notifications_list');
    let current = [];
    if (saved) {
      try { current = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    localStorage.setItem('triggered_notifications_list', JSON.stringify([newNotif, ...current]));
  };

  // Activity Log creation helper
  const addActivityLog = (event: string, status: ActivityLog['status'] = 'Info') => {
    if (!profile) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      event,
      timestamp: new Date().toISOString(),
      device: "MacBook Pro (Chrome 122.0.0)",
      status
    };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    saveActivityLogs(updated);
  };

  // 1. Profile Actions
  const handleUpdatePhoto = (url: string) => {
    if (!profile) return;
    const updated = { ...profile, profilePhoto: url };
    setProfile(updated);
    saveProfile(updated);
    addActivityLog("Profile avatar updated", "Success");
  };

  const handleRemovePhoto = () => {
    if (!profile) return;
    const updated = { ...profile, profilePhoto: "" };
    setProfile(updated);
    saveProfile(updated);
    addActivityLog("Profile avatar removed", "Info");
    toast.success("Profile photo removed.");
  };

  const handleUpdatePersonalInfo = (data: UserProfile) => {
    setProfile(data);
    saveProfile(data);
    addActivityLog("Personal credentials updated", "Success");
  };

  const handleUpdateKycStatus = (status: UserProfile['kycStatus']) => {
    if (!profile) return;
    const updated = { ...profile, kycStatus: status };
    setProfile(updated);
    saveProfile(updated);
    addActivityLog(`KYC status updated: ${status}`, status === 'Approved' ? 'Success' : status === 'Rejected' ? 'Failed' : 'Info');
    
    logSystemNotification(
      `KYC Audit Status: ${status}`,
      status === 'Approved' 
        ? "Your compliance verification audit succeeded. Account is active." 
        : status === 'Rejected' 
          ? "Verification documents were rejected. Please review logs." 
          : "Your KYC files are currently under review."
    );
  };

  // 2. Settings Preferences
  const handleUpdateSettings = (updated: Partial<UserSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...updated };
    setSettings(next);
    saveSettings(next);
    addActivityLog("User preferences customized", "Info");
  };

  // 3. Bank Account Actions (Linked to Wallet storage)
  const handleAddBank = (bank: Omit<BankAccount, 'id' | 'status'> & { upiId?: string }) => {
    const id = `bank-${Date.now()}`;
    const newItem: BankAccount = {
      ...bank,
      id,
      status: 'Pending'
    };
    const updated = [...bankAccounts, newItem];
    setBankAccounts(updated);
    saveBankAccounts(updated);
    addActivityLog(`Bank account added: ${bank.bankName}`, "Info");
    
    // Add upiId to localStorage specifically for details
    if (bank.upiId) {
      localStorage.setItem(`bank_upi_${id}`, bank.upiId);
    }
  };

  const handleEditBank = (id: string, updatedDetails: Omit<BankAccount, 'id' | 'status'> & { upiId?: string }) => {
    const updated = bankAccounts.map((bank) => {
      if (bank.id === id) {
        return { ...bank, ...updatedDetails };
      }
      return bank;
    });
    setBankAccounts(updated);
    saveBankAccounts(updated);
    addActivityLog(`Bank credentials modified: ${updatedDetails.bankName}`, "Info");
    
    if (updatedDetails.upiId) {
      localStorage.setItem(`bank_upi_${id}`, updatedDetails.upiId);
    }
  };

  const handleDeleteBank = (id: string) => {
    const bank = bankAccounts.find(b => b.id === id);
    const updated = bankAccounts.filter((b) => b.id !== id);
    setBankAccounts(updated);
    saveBankAccounts(updated);
    addActivityLog(`Bank account removed: ${bank?.bankName || 'N/A'}`, "Warning");
    localStorage.removeItem(`bank_upi_${id}`);
  };

  const handleVerifyBank = (id: string) => {
    const updated = bankAccounts.map((bank) => {
      if (bank.id === id) {
        return { ...bank, status: 'Verified' as const };
      }
      return bank;
    });
    setBankAccounts(updated);
    saveBankAccounts(updated);
    addActivityLog("Bank account verification successful", "Success");
  };

  // 4. API Keys
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
    addActivityLog(`API Key created: ${key.name}`, "Success");
  };

  const handleDeleteApiKey = (id: string) => {
    const key = apiKeys.find(k => k.id === id);
    const updated = apiKeys.filter((k) => k.id !== id);
    setApiKeys(updated);
    saveApiKeys(updated);
    addActivityLog(`API Key revoked: ${key?.name}`, "Warning");
  };

  // 5. Webhooks
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
    addActivityLog(`Webhook added: ${hook.url}`, "Info");
  };

  const handleDeleteWebhook = (id: string) => {
    const hook = webhooks.find(h => h.id === id);
    const updated = webhooks.filter((h) => h.id !== id);
    setWebhooks(updated);
    saveWebhooks(updated);
    addActivityLog(`Webhook revoked: ${hook?.url}`, "Warning");
  };

  const handleToggleWebhook = (id: string) => {
    const updated = webhooks.map((h) => {
      if (h.id === id) {
        const nextStatus = h.status === 'Active' ? 'Inactive' as const : 'Active' as const;
        addActivityLog(`Webhook ${h.url} set to ${nextStatus}`, "Info");
        return { ...h, status: nextStatus };
      }
      return h;
    });
    setWebhooks(updated);
    saveWebhooks(updated);
  };

  // 6. Support Tickets
  const handleAddTicket = (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'messages'>) => {
    const id = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newMsg: SupportMessage = {
      sender: 'User',
      text: ticket.description,
      time: new Date().toISOString()
    };
    
    const newItem: SupportTicket = {
      ...ticket,
      id,
      status: 'Open',
      createdAt: new Date().toISOString(),
      messages: [newMsg]
    };

    const updated = [...tickets, newItem];
    setTickets(updated);
    saveTickets(updated);
    addActivityLog(`Support ticket logged: ${id}`, "Info");
  };

  const handleAddTicketMessage = (ticketId: string, message: string) => {
    const newMsg: SupportMessage = {
      sender: 'User',
      text: message,
      time: new Date().toISOString()
    };

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setTickets(updated);
    saveTickets(updated);
  };

  // 7. Device Management
  const handleLogoutDevice = (id: string) => {
    const updated = devices.filter((d) => d.id !== id);
    setDevices(updated);
    saveDevices(updated);
    addActivityLog("Authorized device session terminated", "Warning");
  };

  const handleLogoutAllDevices = () => {
    const current = devices.filter((d) => d.current);
    setDevices(current);
    saveDevices(current);
    addActivityLog("All other device sessions revoked", "Warning");
  };

  if (!mounted) return null;

  const tabs = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'info', label: 'Personal Information', icon: Globe },
    { id: 'kyc', label: 'KYC Verification', icon: ShieldCheck },
    { id: 'security', label: 'Security Configuration', icon: Lock },
    { id: 'devices', label: 'Device Management', icon: Smartphone },
    { id: 'banks', label: 'Linked Bank Accounts', icon: Building2 },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'regional', label: 'Language & Region', icon: Globe },
    { id: 'privacy', label: 'Privacy & Erase', icon: EyeOff },
    { id: 'api', label: 'Developer API Access', icon: Key },
    { id: 'activity', label: 'Profile Activity logs', icon: History },
    { id: 'help', label: 'Help & Support Desk', icon: LifeBuoy }
  ];

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Overview';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen text-foreground pb-20">
      {/* Page Header */}
      <div className="border-b border-border/70 pb-5 text-left font-sans">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          Platform Configuration Workspace
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            SECURITY & PREFERENCES
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Audits identity records, KYC compliances, security tokens, banking, API hooks, and support communications.
        </p>
      </div>

      {isLoadingState ? (
        // Skeleton Loader Panel
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse text-left">
          <div className="lg:col-span-3 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-10 bg-panel/40 border border-border/20 rounded-lg" />
            ))}
          </div>
          <div className="lg:col-span-9 h-96 bg-panel/30 border border-border/20 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Panel (Desktop Sidebar) */}
          <div className="hidden lg:block lg:col-span-3 space-y-1 bg-card/90 p-2.5 rounded-2xl border border-border/80 shadow-xl font-mono">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-extrabold border border-amber-400/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Dropdown Select */}
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

          {/* Right Content Panel (Dynamic Tab views) */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {profile && settings && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Overview tab */}
                  {activeTab === 'overview' && (
                    <ProfileOverviewTab
                      profile={profile}
                      onUpdatePhoto={handleUpdatePhoto}
                      onRemovePhoto={handleRemovePhoto}
                      onNavigateTab={setActiveTab}
                    />
                  )}

                  {/* Personal details tab */}
                  {activeTab === 'info' && (
                    <PersonalInfoTab
                      profile={profile}
                      onSave={handleUpdatePersonalInfo}
                    />
                  )}

                  {/* KYC tab */}
                  {activeTab === 'kyc' && (
                    <KycVerificationTab
                      profile={profile}
                      onUpdateStatus={handleUpdateKycStatus}
                    />
                  )}

                  {/* Security tab */}
                  {activeTab === 'security' && (
                    <SecuritySettingsTab
                      settings={settings}
                      onUpdateSecuritySettings={handleUpdateSettings}
                    />
                  )}

                  {/* Devices tab */}
                  {activeTab === 'devices' && (
                    <DeviceManagementTab
                      devices={devices}
                      onLogoutDevice={handleLogoutDevice}
                      onLogoutAllDevices={handleLogoutAllDevices}
                    />
                  )}

                  {/* Banks tab */}
                  {activeTab === 'banks' && (
                    <BankAccountsTab
                      accounts={bankAccounts.map((b) => {
                        const savedUpi = localStorage.getItem(`bank_upi_${b.id}`);
                        return { ...b, upiId: savedUpi || undefined };
                      })}
                      onAddAccount={handleAddBank}
                      onEditAccount={handleEditBank}
                      onDeleteAccount={handleDeleteBank}
                      onVerifyAccount={handleVerifyBank}
                    />
                  )}

                  {/* Notifications tab */}
                  {activeTab === 'notifications' && (
                    <NotificationsTab
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                    />
                  )}

                  {/* Language tab */}
                  {activeTab === 'regional' && (
                    <LanguageRegionTab
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                    />
                  )}

                  {/* Privacy tab */}
                  {activeTab === 'privacy' && (
                    <PrivacyTab
                      profile={profile}
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                    />
                  )}

                  {/* API keys tab */}
                  {activeTab === 'api' && (
                    <ApiAccessTab
                      apiKeys={apiKeys}
                      webhooks={webhooks}
                      onAddApiKey={handleAddApiKey}
                      onDeleteApiKey={handleDeleteApiKey}
                      onAddWebhook={handleAddWebhook}
                      onDeleteWebhook={handleDeleteWebhook}
                      onToggleWebhook={handleToggleWebhook}
                    />
                  )}

                  {/* Activity log tab */}
                  {activeTab === 'activity' && (
                    <ActivityLogTab
                      logs={activityLogs}
                      transactions={loadTransactions()}
                    />
                  )}

                  {/* Support tab */}
                  {activeTab === 'help' && (
                    <HelpSupportTab
                      tickets={tickets}
                      onAddTicket={handleAddTicket}
                      onAddTicketMessage={handleAddTicketMessage}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
