'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  MessageSquare, 
  Activity, 
  Cpu, 
  Send, 
  CheckSquare, 
  AlertOctagon, 
  Search,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AiMetric, AiPromptLog, AdminSupportTicket, AdminSupportMessage } from '@/lib/adminMock';

interface AiSupportViewProps {
  aiMetric: AiMetric;
  aiPrompts: AiPromptLog[];
  setAiPrompts: (prompts: AiPromptLog[]) => void;
  tickets: AdminSupportTicket[];
  setTickets: (tickets: AdminSupportTicket[]) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
  activeTabInit?: 'ai' | 'support';
}

export default function AiSupportView({
  aiMetric,
  aiPrompts,
  setAiPrompts,
  tickets,
  setTickets,
  logAction,
  permissions,
  activeTabInit = 'ai'
}: AiSupportViewProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'support'>(activeTabInit);
  const [searchPrompt, setSearchPrompt] = useState('');
  
  // Support state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'All' | 'Open' | 'Resolved'>('Open');

  const canModifyAi = permissions.ai;
  const canModifySupport = permissions.support;

  // Selected Ticket Object
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Filtered support tickets
  const filteredTickets = tickets.filter(t => {
    if (ticketFilter === 'All') return true;
    return t.status === ticketFilter;
  });

  // Filtered prompts
  const filteredPrompts = aiPrompts.filter(p => 
    p.prompt.toLowerCase().includes(searchPrompt.toLowerCase()) ||
    p.userId.toLowerCase().includes(searchPrompt.toLowerCase())
  );

  // Reply handler
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifySupport) return toast.error('Access Denied: Content and Finance roles cannot manage support logs.');
    if (!selectedTicketId || !replyText.trim()) return;

    const newMsg: AdminSupportMessage = {
      sender: 'Admin',
      senderName: 'System Desk Operator',
      text: replyText,
      time: new Date().toISOString()
    };

    const updated = tickets.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
          status: 'Open' as const // keep open or toggles
        };
      }
      return t;
    });

    setTickets(updated);
    logAction(`Sent support message response on Ticket ID ${selectedTicketId}`);
    setReplyText('');
    toast.success('Reply sent successfully');
  };
  // Toggle Ticket Status
  const toggleTicketStatus = (id: string, current: 'Open' | 'Resolved') => {
    if (!canModifySupport) return toast.error('Access Denied');
    const nextStatus = (current === 'Open' ? 'Resolved' : 'Open') as 'Open' | 'Resolved';
    
    const updated = tickets.map(t => {
      if (t.id === id) return { ...t, status: nextStatus };
      return t;
    });
    setTickets(updated);
    logAction(`Toggled Support Ticket status ${id} to ${nextStatus}`);
    toast.success(`Ticket marked as ${nextStatus}`);
  };
  return (
    <div className="space-y-6">
      {/* Sub tabs selectors */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'ai' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Operations & API Audits
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'support' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Support Tickets Center
          <span className="px-1.5 py-0.5 text-[9px] bg-muted rounded text-muted-foreground font-mono">
            {tickets.filter(t => t.status === 'Open').length}
          </span>
        </button>
      </div>

      {/* AI OPERATIONS MONITOR */}
      {activeTab === 'ai' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* AI Metrics Gauges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">AI API Health</span>
                <span className="text-base font-bold text-foreground font-mono">{aiMetric.apiHealth}</span>
              </div>
              <Activity className="w-6 h-6 text-bullish shrink-0" />
            </Card>

            <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Tokens Processed</span>
                <span className="text-base font-bold text-foreground font-mono">
                  {aiMetric.creditsUsed.toLocaleString()}
                </span>
              </div>
              <Cpu className="w-6 h-6 text-primary shrink-0" />
            </Card>

            <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Credits Allocated</span>
                <span className="text-base font-bold text-foreground font-mono">
                  {aiMetric.creditsRemaining.toLocaleString()}
                </span>
              </div>
              <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
            </Card>

            <Card className="bg-panel border-border/80 p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Average Latency</span>
                <span className="text-base font-bold text-foreground font-mono">{aiMetric.averageResponseTimeMs}ms</span>
              </div>
              <Clock className="w-6 h-6 text-primary shrink-0" />
            </Card>
          </div>

          {/* Prompt audit logs table */}
          <Card className="bg-panel border-border/80">
            <CardHeader className="pb-3 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-bold">Stochastic AI Prompt Log Ledger</CardTitle>
                <CardDescription className="text-xs">Audit database mapping prompt inputs and token prices.</CardDescription>
              </div>
              
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search prompts, user ID..." 
                  value={searchPrompt}
                  onChange={e => setSearchPrompt(e.target.value)}
                  className="pl-9 bg-card text-xs h-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground">Prompt ID</th>
                      <th className="p-3 font-semibold text-muted-foreground">User ID</th>
                      <th className="p-3 font-semibold text-muted-foreground">Prompt Query</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Tokens Used</th>
                      <th className="p-3 font-semibold text-muted-foreground text-right">Cost (USD)</th>
                      <th className="p-3 font-semibold text-muted-foreground text-center">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono">
                    {filteredPrompts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground italic font-sans">
                          No prompts audit logs indexed.
                        </td>
                      </tr>
                    ) : (
                      filteredPrompts.map(p => (
                        <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-bold text-foreground">{p.id}</td>
                          <td className="p-3 text-muted-foreground">{p.userId}</td>
                          <td className="p-3 text-foreground font-sans truncate max-w-sm" title={p.prompt}>
                            {p.prompt}
                          </td>
                          <td className="p-3 text-right font-semibold text-foreground">{p.tokensUsed}</td>
                          <td className="p-3 text-right text-bearish">${p.costUSD.toFixed(4)}</td>
                          <td className="p-3 text-center text-muted-foreground font-sans text-[10px]">
                            {new Date(p.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUPPORT TICKETS INBOX */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Left panel: tickets list */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex border border-border rounded overflow-hidden text-xs">
              {(['Open', 'Resolved', 'All'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTicketFilter(f)}
                  className={`flex-1 py-2 text-center font-semibold cursor-pointer ${
                    ticketFilter === f ? 'bg-muted text-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f} ({f === 'All' ? tickets.length : tickets.filter(t => t.status === f).length})
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {filteredTickets.length === 0 ? (
                <Card className="bg-panel border-border/80 p-8 text-center text-muted-foreground italic text-xs">
                  No support tickets found in this queue.
                </Card>
              ) : (
                filteredTickets.map(t => {
                  const isSelected = selectedTicketId === t.id;
                  return (
                    <Card 
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                        isSelected 
                          ? 'bg-primary/5 border-primary shadow-sm' 
                          : 'bg-panel border-border/80 hover:border-primary/20'
                      }`}
                    >
                      <CardContent className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">{t.id}</span>
                          <Badge variant={t.status === 'Open' ? 'secondary' : 'default'} className="text-[8px] py-0 font-bold uppercase">
                            {t.status}
                          </Badge>
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate">{t.subject}</h4>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-mono">
                          <span>By: {t.userName}</span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: ticket conversation */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="bg-panel border-border/80 h-full flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 border-primary/20 text-primary text-[9px] font-mono">
                          {selectedTicket.category}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground">{selectedTicket.id}</span>
                      </div>
                      <CardTitle className="text-sm font-bold">{selectedTicket.subject}</CardTitle>
                      <CardDescription className="text-xs">
                        Opened by <span className="font-semibold text-foreground">{selectedTicket.userName}</span> ({selectedTicket.userId}) on {new Date(selectedTicket.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleTicketStatus(selectedTicket.id, selectedTicket.status)}
                      className={`text-xs gap-1.5 cursor-pointer bg-card ${
                        selectedTicket.status === 'Open' ? 'text-bullish border-bullish/25 hover:bg-bullish/5' : 'text-amber-500 border-amber-500/25 hover:bg-amber-500/5'
                      }`}
                    >
                      {selectedTicket.status === 'Open' ? <CheckCircle className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
                      Mark {selectedTicket.status === 'Open' ? 'Resolved' : 'Reopen'}
                    </Button>
                  </div>

                  <div className="mt-3 bg-card border border-border/60 rounded p-3 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground block mb-1">Issue Description:</span>
                    {selectedTicket.description}
                  </div>
                </CardHeader>

                {/* Conversation messages */}
                <div className="flex-1 p-4 space-y-4 max-h-[35vh] overflow-y-auto scrollbar-thin bg-card/40 divide-y divide-border/20">
                  {selectedTicket.messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'Admin';
                    return (
                      <div key={idx} className={`flex flex-col gap-1.5 pt-3 first:pt-0 ${isAdmin ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground">
                          <span className="font-bold text-foreground">{msg.senderName}</span>
                          <span>•</span>
                          <span>{new Date(msg.time).toLocaleTimeString()}</span>
                        </div>
                        <div className={`max-w-md rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          isAdmin 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'bg-muted border border-border text-foreground'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Send reply form */}
                <form 
                  onSubmit={handleSendReply}
                  className="p-4 border-t border-border/60 bg-muted/10 flex gap-2"
                >
                  <Input
                    placeholder="Type support response or rotation instructions..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="flex-1 bg-card text-xs outline-none"
                    disabled={selectedTicket.status === 'Resolved'}
                  />
                  <Button 
                    type="submit" 
                    size="sm"
                    disabled={selectedTicket.status === 'Resolved' || !replyText.trim()}
                    className="gap-1 font-bold cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="bg-panel border-border/80 p-12 text-center text-muted-foreground italic h-full flex flex-col justify-center items-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                Select a support ticket from the list queue to review parameters or chat with client.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
