import React, { useState } from 'react';
import { SupportTicket, SupportMessage } from '@/lib/profileMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  MessageSquare, 
  Plus, 
  Send, 
  X, 
  ChevronDown, 
  Phone, 
  Mail, 
  LifeBuoy,
  MessageCircle,
  FileCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface HelpSupportTabProps {
  tickets: SupportTicket[];
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'messages'>) => void;
  onAddTicketMessage: (ticketId: string, message: string) => void;
}

export default function HelpSupportTab({
  tickets,
  onAddTicket,
  onAddTicketMessage
}: HelpSupportTabProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Modals & Chat state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState<boolean>(false);
  
  // Forms fields
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketCategory, setTicketCategory] = useState<'General' | 'API Access' | 'KYC Verification' | 'Trading Issues' | 'Deposits/Withdrawals'>('General');
  const [ticketDesc, setTicketDesc] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');

  // Live Chat state simulation
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    { sender: 'agent', text: "Hello Alex, this is the StockInside Treasury Desk. How can we support your quantitative simulations today?", time: "11:02" }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  const faqs = [
    {
      q: "How does the manual deposit verification audit work?",
      a: "Manual deposits require you to transfer funds to our clearing account via UPI/Bank details, and then upload the transaction UTR reference hash along with a screenshot. Our compliance officers match these entries on our bank feeds and credit your wallet. Verification is completed within 10-30 minutes."
    },
    {
      q: "How long do cash out withdrawals take to clear?",
      a: "Withdrawals requested from verified settlement bank accounts are audited automatically. In mock sandbox environments, requests clear within 15 seconds to simulate real-time API integrations, updating your cash balance ledger."
    },
    {
      q: "Why is my KYC verification flag showing Pending?",
      a: "Profile KYC defaults to Approved in your sandbox profile. However, if you trigger a new verification stepper flow, compliance auditors will need to review your document proof uploads before status updates to active."
    },
    {
      q: "How do I fetch indicators variables via the REST API keys?",
      a: "Generate an API Key under the Developer API Access tab, copy the Secret Token, and append it as an Authorization Bearer header to your HTTP requests."
    }
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      toast.error("Please fill in subject and description fields.");
      return;
    }

    onAddTicket({
      subject: ticketSubject.trim(),
      category: ticketCategory,
      description: ticketDesc.trim()
    });

    setTicketSubject('');
    setTicketDesc('');
    setIsNewTicketOpen(false);
    toast.success("Support ticket logged successfully! Assigned to queue.");
  };

  const handleSendReply = (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddTicketMessage(ticketId, replyText.trim());
    
    // Update active modal ticket details
    if (activeTicket && activeTicket.id === ticketId) {
      setActiveTicket({
        ...activeTicket,
        messages: [
          ...activeTicket.messages,
          { sender: 'User', text: replyText.trim(), time: new Date().toISOString() }
        ]
      });
    }

    setReplyText('');
    toast.success("Reply transmitted.");

    // Simulate Agent response after 5 seconds
    setTimeout(() => {
      onAddTicketMessage(ticketId, "Thank you for the update. Our compliance auditor is reviewing the ledger log.");
      if (activeTicket && activeTicket.id === ticketId) {
        setActiveTicket((t) => t ? {
          ...t,
          messages: [
            ...t.messages,
            { sender: 'Support', text: "Thank you for the update. Our compliance auditor is reviewing the ledger log.", time: new Date().toISOString() }
          ]
        } : null);
      }
      toast.info("New support response received for ticket " + ticketId);
    }, 4000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user' as const, text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Simulate agent auto reply
    setTimeout(() => {
      const agentMsg = {
        sender: 'agent' as const,
        text: "Understood. The clearing ledger indicates your manual UTR check is processing. Verification will conclude shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, agentMsg]);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left relative">
      {/* FAQs & Accordions (Left Column) */}
      <div className="lg:col-span-7 space-y-6">
        {/* FAQs */}
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-primary" /> Common FAQs
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Quick guides to help resolve standard sandbox profile configurations.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-border/40 rounded-lg overflow-hidden bg-panel/30">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-4 py-3 text-xs font-bold text-foreground hover:bg-muted/40 transition-colors flex justify-between items-center cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/20 px-4 py-3 text-[11px] text-muted-foreground leading-relaxed bg-card"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Support Tickets Queue */}
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-indigo-400" /> Active Support Tickets
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Audit past complaints and communication chains.</p>
            </div>
            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-[10px] rounded cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> New Ticket
            </button>
          </div>

          <div className="space-y-2">
            {tickets.map((t) => (
              <div 
                key={t.id} 
                onClick={() => setActiveTicket(t)}
                className="p-3 bg-panel/30 border border-border/30 rounded-lg hover:border-border/60 transition-all flex items-center justify-between text-xs cursor-pointer"
              >
                <div className="space-y-0.5 truncate">
                  <span className="font-bold text-foreground block truncate">{t.subject}</span>
                  <span className="text-[10px] text-muted-foreground font-mono block">ID: {t.id} • {t.category} • Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                    t.status === 'Open' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support Details Desk (Right Column) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Contact Info */}
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-5 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-foreground">Global Helplines</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Reach out to our desks directly via voice or email.</p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3 pb-3.5 border-b border-border/30">
              <div className="p-2 rounded bg-panel border border-border text-primary">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Trading Desk Helpline</span>
                <span className="text-foreground font-mono font-semibold block">+1 (800) 991-QUANT</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-panel border border-border text-primary">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Compliance Support email</span>
                <span className="text-foreground font-semibold block">desk@stockinside-trading.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Chat widget button inside tab */}
        <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block">Instantly Chat with Experts</span>
            <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[220px] mx-auto leading-relaxed">
              Launch our dynamic mock live support chat terminal to speak with our compliance bot.
            </p>
          </div>
          <button
            onClick={() => setIsChatWidgetOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-[10px] font-mono rounded shadow-sm cursor-pointer transition-all uppercase"
          >
            Launch Live Chat
          </button>
        </div>
      </div>

      {/* 1. Support Ticket create dialog overlay */}
      <AnimatePresence>
        {isNewTicketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-foreground">Log Technical Support Ticket</h3>
              <p className="text-xs text-muted-foreground mt-1">Submit technical details. Our clearing desk will audit events.</p>

              <form onSubmit={handleCreateTicket} className="space-y-4 mt-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="tSubject" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Ticket Subject</label>
                  <input
                    id="tSubject"
                    type="text"
                    placeholder="Brief summary of the issue..."
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tCat" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Category</label>
                  <select
                    id="tCat"
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                  >
                    <option value="General">General / Platform Setup</option>
                    <option value="API Access">API Access / Credentials</option>
                    <option value="KYC Verification">KYC Verification / Compliance</option>
                    <option value="Trading Issues">Trading Issues / Live Quotes</option>
                    <option value="Deposits/Withdrawals">Deposits / Withdrawals</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="tDesc" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Detailed Description</label>
                  <textarea
                    id="tDesc"
                    placeholder="Please include full parameters details..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground h-20 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer mt-2"
                >
                  File Support Ticket
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. Ticket conversation view dialog */}
        {activeTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setActiveTicket(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="border-b border-border/40 pb-4 shrink-0 text-left pr-8">
                <span className="text-[9px] font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {activeTicket.category.toUpperCase()}
                </span>
                <h3 className="text-base font-extrabold text-foreground font-mono mt-1.5 truncate">
                  {activeTicket.subject}
                </h3>
                <span className="text-[10px] text-muted-foreground block font-mono">ID: {activeTicket.id} • Status: {activeTicket.status.toUpperCase()}</span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 min-h-[220px]">
                {/* Description opening message */}
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                    U
                  </div>
                  <div className="p-3 rounded-lg bg-panel/40 border border-border/30 max-w-[80%] text-xs text-foreground text-left leading-relaxed">
                    <p className="font-semibold text-muted-foreground text-[10px] mb-1 font-mono">TICKET INITIALIZATION DETAILS</p>
                    {activeTicket.description}
                  </div>
                </div>

                {activeTicket.messages.map((m, idx) => (
                  <div key={idx} className={`flex gap-2.5 items-start ${m.sender === 'User' ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      m.sender === 'User' 
                        ? 'bg-primary/20 text-primary border-primary/30' 
                        : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    }`}>
                      {m.sender === 'User' ? 'U' : 'S'}
                    </div>
                    <div className={`p-3 rounded-lg max-w-[80%] text-xs text-foreground text-left leading-relaxed ${
                      m.sender === 'User' 
                        ? 'bg-panel/40 border border-border/30' 
                        : 'bg-indigo-500/5 border border-indigo-500/15'
                    }`}>
                      {m.text}
                      <span className="text-[9px] text-muted-foreground block font-mono mt-1.5 text-right">
                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {activeTicket.status === 'Open' && (
                <form onSubmit={(e) => handleSendReply(e, activeTicket.id)} className="border-t border-border/40 pt-4 shrink-0 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type comments to support agent..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    required
                  />
                  <button
                    type="submit"
                    className="p-2 bg-primary hover:bg-primary/95 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}

        {/* 3. Floating Live Chat Widget Mockup Overlay */}
        {isChatWidgetOpen && (
          <div className="fixed bottom-6 right-6 z-50 w-80 h-96 rounded-xl border border-panel-border bg-card shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-primary text-white p-3.5 flex justify-between items-center select-none shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-xs font-bold block">Live Support Agent</span>
                  <span className="text-[9px] opacity-75 block font-mono">StockInside Clearing Desk</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatWidgetOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-panel/20 text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-2.5 rounded-lg max-w-[85%] text-left leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-card border border-border text-foreground rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="border-t border-border/40 p-2.5 bg-card flex gap-1.5 shrink-0">
              <input
                type="text"
                placeholder="Ask support bot..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                required
              />
              <button
                type="submit"
                className="p-2 bg-primary hover:bg-primary/95 text-white rounded-lg cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
