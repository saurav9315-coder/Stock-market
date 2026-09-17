import React, { useState } from 'react';
import { ApiKey, Webhook } from '@/lib/profileMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Webhook as WebhookIcon, 
  Eye, 
  X,
  Code,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiAccessTabProps {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  onAddApiKey: (key: Omit<ApiKey, 'id' | 'secret' | 'createdAt'>) => void;
  onDeleteApiKey: (id: string) => void;
  onAddWebhook: (hook: Omit<Webhook, 'id' | 'secret' | 'createdAt' | 'status'>) => void;
  onDeleteWebhook: (id: string) => void;
  onToggleWebhook: (id: string) => void;
}

export default function ApiAccessTab({
  apiKeys,
  webhooks,
  onAddApiKey,
  onDeleteApiKey,
  onAddWebhook,
  onDeleteWebhook,
  onToggleWebhook
}: ApiAccessTabProps) {
  // Modal states
  const [isKeyCreateOpen, setIsKeyCreateOpen] = useState<boolean>(false);
  const [isWebhookCreateOpen, setIsWebhookCreateOpen] = useState<boolean>(false);
  const [newKeyDetails, setNewKeyDetails] = useState<{ id: string; secret: string } | null>(null);

  // Form Fields
  const [keyName, setKeyName] = useState<string>('');
  const [keyPermissions, setKeyPermissions] = useState<'Read' | 'Trade' | 'Full Access'>('Read');
  const [webhookUrl, setWebhookUrl] = useState<string>('');

  // Copy states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast.error("Please enter a label for the API Key.");
      return;
    }

    const mockId = `ag_pk_${Math.floor(100000 + Math.random() * 900000).toString(16)}`;
    const mockSecret = `ag_sk_${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;

    onAddApiKey({
      name: keyName.trim(),
      permissions: keyPermissions
    });

    setNewKeyDetails({ id: mockId, secret: mockSecret });
    setKeyName('');
    setIsKeyCreateOpen(false);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !webhookUrl.startsWith('http')) {
      toast.error("Please enter a valid HTTP/HTTPS endpoint URL.");
      return;
    }

    onAddWebhook({
      url: webhookUrl.trim()
    });

    setWebhookUrl('');
    setIsWebhookCreateOpen(false);
    toast.success("Webhook endpoint registered successfully.");
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. API Keys Section */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Key className="w-4 h-4 text-primary" /> API Key Credentials
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Programmatic credentials to stream quantitative ticks and feed execution algorithms.
            </p>
          </div>
          <button
            onClick={() => setIsKeyCreateOpen(true)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create API Key
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/30">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/30 bg-panel/30 text-[10px] uppercase font-bold text-muted-foreground font-mono">
                <th className="py-2.5 px-3">Label</th>
                <th className="py-2.5 px-3">Access Scope</th>
                <th className="py-2.5 px-3">Public Key ID</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-muted-foreground">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[11px]">
                    No API keys created. Link a programmatic key above.
                  </td>
                </tr>
              ) : (
                apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-panel/10">
                    <td className="py-3 px-3 font-semibold text-foreground">{k.name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        k.permissions === 'Full Access' ? 'bg-rose-500/10 text-rose-400' : k.permissions === 'Trade' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {k.permissions.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium">{k.id}</td>
                    <td className="py-3 px-3 font-mono">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => { onDeleteApiKey(k.id); toast.success(`API key ${k.name} revoked.`); }}
                        className="p-1 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Webhooks Section */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <WebhookIcon className="w-4 h-4 text-indigo-400" /> Server Webhooks
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Post JSON payloads to your servers instantly when indicators trigger alerts.
            </p>
          </div>
          <button
            onClick={() => setIsWebhookCreateOpen(true)}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Configure Webhook
          </button>
        </div>

        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <div className="p-6 text-center border border-border/30 bg-panel/30 rounded-lg text-xs text-muted-foreground">
              No webhook endpoints registered.
            </div>
          ) : (
            webhooks.map((hook) => (
              <div key={hook.id} className="flex items-center justify-between p-3.5 bg-panel/30 border border-border/30 rounded-xl text-xs gap-3">
                <div className="space-y-1 truncate">
                  <span className="font-mono text-foreground font-semibold block truncate">{hook.url}</span>
                  <span className="text-[10px] text-muted-foreground font-mono block">Secret: {hook.secret} • Created: {new Date(hook.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onToggleWebhook(hook.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={hook.status === 'Active' ? 'Deactivate Webhook' : 'Activate Webhook'}
                  >
                    {hook.status === 'Active' ? (
                      <ToggleRight className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => { onDeleteWebhook(hook.id); toast.success("Webhook revoked."); }}
                    className="p-1.5 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Access Tokens Panel placeholder */}
      <div className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Code className="w-4 h-4 text-indigo-400" /> OAuth Access Tokens
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Active login sessions tokens issued for dashboard operations.</p>
        </div>

        <div className="p-4 bg-panel/30 border border-border/30 rounded-lg text-xs flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="font-bold text-foreground font-mono block">OAuth_Console_Web_Token</span>
            <span className="text-[9px] text-muted-foreground block font-mono">ag_tok_••••••••••••••••3e8d • Scope: FullAccess • Expires in 23 Hours</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold font-mono">
            <ShieldCheck className="w-4 h-4" /> ACTIVE
          </span>
        </div>
      </div>

      {/* API Key details Lightbox/Created Modal Overlay */}
      <AnimatePresence>
        {isKeyCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsKeyCreateOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-foreground">Create API Access Credentials</h3>
              <p className="text-xs text-muted-foreground mt-1">Specify label and permissions boundaries for key authorization.</p>

              <form onSubmit={handleCreateKey} className="space-y-4 mt-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="kName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Key Label Name</label>
                  <input
                    id="kName"
                    type="text"
                    placeholder="e.g. Backtest_Node_1"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="kPerms" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Scope Permissions</label>
                  <select
                    id="kPerms"
                    value={keyPermissions}
                    onChange={(e) => setKeyPermissions(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
                  >
                    <option value="Read">Read-Only (Indicators & Quotes)</option>
                    <option value="Trade">Trade Capabilities (Buy/Sell/Cashouts)</option>
                    <option value="Full Access">Full Access (Audit Queue & Keys Management)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer mt-2"
                >
                  Generate Credentials
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Display newly created key secret */}
        {newKeyDetails && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setNewKeyDetails(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <h4 className="text-base font-bold text-foreground">API Credentials Generated</h4>
                <p className="text-xs text-rose-400 font-semibold max-w-[280px] mx-auto leading-relaxed">
                  Important: Copy the Secret Key below. It will NOT be shown again.
                </p>
              </div>

              <div className="space-y-3.5 text-left text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Public Key ID</span>
                  <div className="flex items-center justify-between p-2.5 bg-panel border border-border rounded-lg font-mono">
                    <span className="text-foreground font-semibold truncate pr-3">{newKeyDetails.id}</span>
                    <button
                      onClick={() => copyToClipboard(newKeyDetails.id, 'id')}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      {copiedId === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Secret Key Token</span>
                  <div className="flex items-center justify-between p-2.5 bg-panel border border-border rounded-lg font-mono">
                    <span className="text-foreground font-semibold truncate pr-3">{newKeyDetails.secret}</span>
                    <button
                      onClick={() => copyToClipboard(newKeyDetails.secret, 'secret')}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded cursor-pointer"
                    >
                      {copiedId === 'secret' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setNewKeyDetails(null)}
                className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer mt-2"
              >
                I Have Copied Secret Key
              </button>
            </motion.div>
          </div>
        )}

        {/* Configure Webhook Modal */}
        {isWebhookCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsWebhookCreateOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-bold text-foreground">Configure webhook URL</h3>
              <p className="text-xs text-muted-foreground mt-1">Specify destination URL. Secret key will be auto-generated.</p>

              <form onSubmit={handleCreateWebhook} className="space-y-4 mt-4 text-left">
                <div className="space-y-1.5">
                  <label htmlFor="webUrl" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Endpoint Endpoint URL</label>
                  <input
                    id="webUrl"
                    type="url"
                    placeholder="e.g. https://api.yoursite.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer mt-2"
                >
                  Configure Webhook
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
