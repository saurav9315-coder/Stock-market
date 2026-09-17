'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw, Send, Check, Settings2, ShieldCheck, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';

// Mock Databases
import { 
  Alert, 
  NotificationItem, 
  INITIAL_ALERTS, 
  INITIAL_NOTIFICATIONS, 
  AlertTemplate,
  generateLiveNotification 
} from '@/lib/alertsMock';

// Subcomponents
import AlertDashboardStats from './components/AlertDashboardStats';
import ActiveAlertsTable from './components/ActiveAlertsTable';
import NotificationLog from './components/NotificationLog';
import AlertConfigurationSidebar from './components/AlertConfigurationSidebar';
import AiSmartAlerts from './components/AiSmartAlerts';
import { CreateAlertModal, ImportExportModal } from './components/AlertsModals';
import { Button } from '@/components/ui/button';

export default function AlertsPage() {
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dynamicIndex, setDynamicIndex] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [selectedSymbolForCreate, setSelectedSymbolForCreate] = useState('');

  // Sync settings
  const [channels, setChannels] = useState<Record<string, boolean>>({
    inApp: true,
    email: true,
    sms: false,
    telegram: false
  });
  const [isSyncingFeeds, setIsSyncingFeeds] = useState(false);

  // Sync state on client mount
  useEffect(() => {
    setMounted(true);

    // Load from local storage or set initial mocks
    const cachedAlerts = localStorage.getItem('active_alerts_list');
    const cachedNotifs = localStorage.getItem('triggered_notifications_list');
    const cachedChannels = localStorage.getItem('notification_channels_config');

    if (cachedAlerts) {
      try { setAlerts(JSON.parse(cachedAlerts)); } catch (e) { setAlerts(INITIAL_ALERTS); }
    } else {
      setAlerts(INITIAL_ALERTS);
    }

    if (cachedNotifs) {
      try { setNotifications(JSON.parse(cachedNotifs)); } catch (e) { setNotifications(INITIAL_NOTIFICATIONS); }
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
    }

    if (cachedChannels) {
      try { setChannels(JSON.parse(cachedChannels)); } catch (e) { }
    }
  }, []);

  // Simulator for WebSocket triggers
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      // Pick a random active alert to simulate a trigger
      const activeAlerts = alerts.filter(a => a.status === 'active');
      if (activeAlerts.length === 0) return;

      const randomAlert = activeAlerts[Math.floor(Math.random() * activeAlerts.length)];
      
      // Update its lastTriggered and currentValue randomly close to target
      setAlerts((prev) => {
        const next = prev.map((a) => {
          if (a.id === randomAlert.id) {
            return {
              ...a,
              currentValue: a.targetValue,
              lastTriggered: new Date().toISOString().slice(0, 16).replace('T', ' '),
              status: a.frequency === 'Once' ? 'expired' as const : 'active' as const
            };
          }
          return a;
        });
        localStorage.setItem('active_alerts_list', JSON.stringify(next));
        return next;
      });

      // Dispatch triggered notification card
      const notifItem = generateLiveNotification(dynamicIndex);
      setDynamicIndex(idx => idx + 1);

      setNotifications((prev) => {
        const updated = [notifItem, ...prev];
        localStorage.setItem('triggered_notifications_list', JSON.stringify(updated));
        return updated;
      });

      // Trigger standard web audio beep (optional/simulated)
      if (channels.inApp) {
        toast.warning(notifItem.title, {
          description: notifItem.description,
          icon: '🔔'
        });
      }
    }, 20000); // Trigger check every 20 seconds

    return () => clearInterval(interval);
  }, [mounted, alerts, dynamicIndex, channels]);

  // Alert Handlers
  const handleCreateAlert = (newAlert: Omit<Alert, 'id' | 'createdAt' | 'lastTriggered' | 'currentValue'>) => {
    const alertItem: Alert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      currentValue: newAlert.targetValue * 0.97, // mock starting value slightly lower
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastTriggered: 'Never'
    };

    setAlerts((prev) => {
      const updated = [alertItem, ...prev];
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });

    toast.success(`Indicator Alert deployed successfully: ${alertItem.symbol}`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
    toast.success('Indicator Alert removed.');
  };

  const handleToggleStatus = (id: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'active' ? 'paused' as const : 'active' as const;
          toast.info(`Alert ${a.symbol} ${nextStatus === 'active' ? 'Resumed' : 'Paused'}`);
          return { ...a, status: nextStatus };
        }
        return a;
      });
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    setAlerts((prev) => {
      const updated = prev.filter(a => !ids.includes(a.id));
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Successfully removed ${ids.length} alerts.`);
  };

  const handleBulkToggle = (ids: string[], status: 'active' | 'paused') => {
    setAlerts((prev) => {
      const updated = prev.map((a) => {
        if (ids.includes(a.id)) {
          return { ...a, status };
        }
        return a;
      });
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Successfully ${status === 'active' ? 'resumed' : 'paused'} ${ids.length} alerts.`);
  };

  const handlePauseAll = () => {
    setAlerts((prev) => {
      const updated = prev.map(a => a.status === 'active' ? { ...a, status: 'paused' as const } : a);
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
    toast.info('All active alarms paused.');
  };

  const handleResumeAll = () => {
    setAlerts((prev) => {
      const updated = prev.map(a => a.status === 'paused' ? { ...a, status: 'active' as const } : a);
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
    toast.success('All paused alarms resumed.');
  };

  // Notification Handlers
  const handleMarkRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('triggered_notifications_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('triggered_notifications_list', JSON.stringify(updated));
      return updated;
    });
    toast.success('All notifications marked read.');
  };

  const handleClearLog = () => {
    setNotifications([]);
    localStorage.removeItem('triggered_notifications_list');
    toast.success('Notification log cleared.');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('triggered_notifications_list', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleChannel = (channelId: string) => {
    setChannels((prev) => {
      const updated = { ...prev, [channelId]: !prev[channelId] };
      localStorage.setItem('notification_channels_config', JSON.stringify(updated));
      toast.info(`Channel settings updated: ${channelId} is now ${updated[channelId] ? 'Enabled' : 'Disabled'}`);
      return updated;
    });
  };

  const handleApplyTemplate = (tmpl: AlertTemplate) => {
    const deployed: Alert[] = tmpl.alerts.map((a, idx) => ({
      id: `alert-tmpl-${Date.now()}-${idx}`,
      symbol: a.symbol,
      type: a.type,
      condition: a.condition,
      currentValue: a.targetValue * 0.98,
      targetValue: a.targetValue,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastTriggered: 'Never',
      frequency: a.frequency
    }));

    setAlerts((prev) => {
      const updated = [...deployed, ...prev];
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });

    toast.success(`Deployed trading template presets: ${tmpl.name}`);
  };

  const handleImportAlerts = (imported: Alert[]) => {
    setAlerts((prev) => {
      const updated = [...imported, ...prev];
      localStorage.setItem('active_alerts_list', JSON.stringify(updated));
      return updated;
    });
    toast.success(`Successfully imported ${imported.length} alert configurations!`);
  };

  const handleSyncFeeds = () => {
    setIsSyncingFeeds(true);
    toast.info('Syncing alert engines with institutional data models...');
    setTimeout(() => {
      setIsSyncingFeeds(false);
      toast.success('Alert dispatch services fully synchronized.');
    }, 1000);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground font-mono text-xs">
        Booting Quantitative Volatility Alarms...
      </div>
    );
  }

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const triggeredTodayCount = notifications.length; // mock triggered logs total
  const expiredAlertsCount = alerts.filter(a => a.status === 'expired').length;

  return (
    <div className="space-y-6 font-sans max-w-[1400px] mx-auto pb-12 select-none">
      {/* 1. Page Header & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5 font-sans">
            Alerts & Notification Desk
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              TRIGGERS ACTIVE
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Configure price alarm ceilings, moving average crossovers, and monitor live triggered notification feeds.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFeeds}
            disabled={isSyncingFeeds}
            className="h-8 gap-1.5 cursor-pointer text-xs border-border/80"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFeeds ? 'animate-spin' : ''}`} />
            Sync
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseAll}
            className="h-8 gap-1.5 cursor-pointer text-xs border-border/80 text-amber-500"
          >
            <Pause className="w-3.5 h-3.5" />
            Pause All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResumeAll}
            className="h-8 gap-1.5 cursor-pointer text-xs border-border/80 text-emerald-500"
          >
            <Play className="w-3.5 h-3.5" />
            Resume All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportExportOpen(true)}
            className="h-8 gap-1.5 cursor-pointer text-xs border-border/80"
          >
            Import / Export
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setSelectedSymbolForCreate('');
              setIsCreateOpen(true);
            }}
            className="h-8 gap-1.5 cursor-pointer text-xs bg-primary text-primary-foreground font-semibold"
          >
            Create Alert
          </Button>
        </div>
      </div>

      {/* 2. Dashboard KPIs Statistics */}
      <AlertDashboardStats
        activeCount={activeAlertsCount}
        triggeredCount={triggeredTodayCount}
        expiredCount={expiredAlertsCount}
      />

      {/* 3. Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Alerts Table */}
          <ActiveAlertsTable
            alerts={alerts}
            onToggleStatus={handleToggleStatus}
            onDeleteAlert={handleDeleteAlert}
            onBulkDelete={handleBulkDelete}
            onBulkToggle={handleBulkToggle}
            onSymbolClick={(sym) => {
              setSelectedSymbolForCreate(sym);
              setIsCreateOpen(true);
            }}
          />

          {/* Triggered Notifications Log */}
          <NotificationLog
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onClearAll={handleClearLog}
            onDeleteNotification={handleDeleteNotification}
            onSymbolClick={(sym) => {
              setSelectedSymbolForCreate(sym);
              setIsCreateOpen(true);
            }}
          />

          {/* AI Recommended Alerts */}
          <AiSmartAlerts
            onAddPresetAlert={handleCreateAlert}
            onSymbolClick={(sym) => {
              setSelectedSymbolForCreate(sym);
              setIsCreateOpen(true);
            }}
          />
        </div>

        {/* Right Column (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sidebar configurations, templates and channels */}
          <AlertConfigurationSidebar
            channels={channels}
            onToggleChannel={handleToggleChannel}
            onApplyTemplate={handleApplyTemplate}
          />
        </div>
      </div>

      {/* 4. Global Modals Overlays */}
      <CreateAlertModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateAlert}
        defaultSymbol={selectedSymbolForCreate}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        alerts={alerts}
        onImport={handleImportAlerts}
      />
    </div>
  );
}
