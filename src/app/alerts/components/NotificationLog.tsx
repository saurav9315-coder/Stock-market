'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Briefcase, Sparkles, Newspaper, Info, Check, Trash2, Eye, CircleDot } from 'lucide-react';
import { NotificationItem } from '@/lib/alertsMock';
import { Button } from '@/components/ui/button';

interface NotificationLogProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onSymbolClick?: (symbol: string) => void;
}

export default function NotificationLog({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onDeleteNotification,
  onSymbolClick
}: NotificationLogProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'price' | 'portfolio' | 'ai' | 'news' | 'system'>('all');

  const tabs = [
    { id: 'all', label: 'All Log' },
    { id: 'unread', label: 'Unread' },
    { id: 'price', label: 'Price Alerts' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'ai', label: 'AI Alerts' },
    { id: 'news', label: 'News Alerts' },
    { id: 'system', label: 'System' }
  ];

  // Filtering
  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !item.read;
    return item.category === activeTab;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'price':
        return <Bell className="w-3.5 h-3.5 text-primary" />;
      case 'portfolio':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-500" />;
      case 'ai':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
      case 'news':
        return <Newspaper className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <Info className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
      {/* 1. Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-2.5">
        <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
          Triggered Notifications log
        </h3>

        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMarkAllRead}
            className="h-7 text-[10px] gap-1 hover:bg-secondary cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            Mark all read
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="h-7 text-[10px] gap-1 hover:bg-secondary cursor-pointer text-rose-500"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Clear Log
          </Button>
        </div>
      </div>

      {/* 2. Log Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => {
          const count = tab.id === 'all' 
            ? notifications.length 
            : tab.id === 'unread' 
              ? notifications.filter(n => !n.read).length
              : notifications.filter(n => n.category === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {tab.label} <span className="text-[10px] opacity-75 font-mono ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      {/* 3. Notifications list */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const isHigh = notif.priority === 'high';
              const isMedium = notif.priority === 'medium';

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-3 rounded-lg border transition-colors flex items-start gap-3 relative group ${
                    notif.read 
                      ? 'bg-secondary/15 border-border/50 hover:bg-secondary/30' 
                      : 'bg-primary/5 border-primary/20 shadow-sm shadow-primary/5 hover:bg-primary/10'
                  }`}
                >
                  {/* Category icon */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-secondary border border-border/70 shrink-0 ${
                    !notif.read ? 'glow-bullish border-primary/30' : ''
                  }`}>
                    {getIcon(notif.category)}
                  </div>

                  {/* Body text */}
                  <div className="flex-1 min-w-0 pr-6 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground truncate">{notif.title}</h4>
                      <span className="text-[9px] text-muted-foreground font-mono shrink-0">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {notif.description}
                    </p>

                    {/* Meta widgets */}
                    <div className="flex items-center gap-3 pt-1 text-[9px] font-mono">
                      {notif.symbol && (
                        <button
                          onClick={() => onSymbolClick?.(notif.symbol!)}
                          className="text-foreground hover:underline font-bold"
                        >
                          {notif.symbol}
                        </button>
                      )}
                      <span className={`font-bold uppercase ${
                        isHigh 
                          ? 'text-rose-500' 
                          : isMedium 
                            ? 'text-amber-500' 
                            : 'text-muted-foreground'
                      }`}>
                        {notif.priority} priority
                      </span>
                    </div>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute right-2 top-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => onMarkRead(notif.id)}
                        className="p-1 rounded hover:bg-secondary text-primary cursor-pointer"
                        title="Mark Read"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteNotification(notif.id)}
                      className="p-1 rounded hover:bg-secondary text-rose-500 cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <CircleDot className="w-1.5 h-1.5 text-primary fill-primary" />
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Bell className="w-8 h-8 text-muted-foreground/35 mb-2" />
              <h4 className="text-xs font-bold text-foreground">Log is Empty</h4>
              <p className="text-[10px] leading-relaxed max-w-xs mt-1">
                You have no notifications in this category. Live triggers will stream in here as threshold events occur.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
