'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiKey, Webhook } from '@/lib/profileMock';

interface ApiDeveloperDeskProps {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  onAddApiKey: (key: Omit<ApiKey, 'id' | 'secret' | 'createdAt'>) => void;
  onDeleteApiKey: (id: string) => void;
  onAddWebhook: (hook: Omit<Webhook, 'id' | 'secret' | 'createdAt' | 'status'>) => void;
  onDeleteWebhook: (id: string) => void;
  onToggleWebhook: (id: string) => void;
}

export default function ApiDeveloperDesk({
  apiKeys,
  webhooks,
  onAddApiKey,
  onDeleteApiKey,
  onAddWebhook,
  onDeleteWebhook,
  onToggleWebhook
}: ApiDeveloperDeskProps) {
  // New Key Form State
  const [newKeyName, setNewKeyName] = useState('');
  const [readPerm, setReadPerm] = useState(true);
  const [writePerm, setWritePerm] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // New Webhook Form State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isCreatingHook, setIsCreatingHook] = useState(false);

  // Visibility states
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const toggleSecretVisibility = (id: string) => {
    setRevealedSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Submit handlers
  const handleCreateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return toast.error('Key label is required');
    
    const permissions: ApiKey['permissions'] = readPerm && writePerm 
      ? 'Full Access' 
      : writePerm 
        ? 'Trade' 
        : 'Read';
        
    onAddApiKey({ name: newKeyName, permissions });
    toast.success(`API Key "${newKeyName}" created successfully.`);
    setNewKeyName('');
    setReadPerm(true);
    setWritePerm(false);
    setIsCreatingKey(false);
  };

  const handleCreateWebhookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !webhookUrl.startsWith('http')) {
      return toast.error('Webhook target URL must be valid HTTP/HTTPS endpoint');
    }
    onAddWebhook({ url: webhookUrl });
    toast.success('Webhook target endpoint registered.');
    setWebhookUrl('');
    setIsCreatingHook(false);
  };

  return (
    <div className="space-y-6">
      {/* API Keys Configuration */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> Private API Tokens
            </CardTitle>
            <CardDescription className="text-xs">Authenticate quantitative automated trading scripts or pipelines endpoints.</CardDescription>
          </div>
          <Button 
            onClick={() => setIsCreatingKey(!isCreatingKey)} 
            size="xs"
            className="cursor-pointer gap-1.5 text-[11px] font-bold text-white"
          >
            <Plus className="w-3.5 h-3.5" /> Generate Token Key
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          
          {/* Create Key Panel Form */}
          {isCreatingKey && (
            <form onSubmit={handleCreateKeySubmit} className="border border-border/80 rounded-xl p-4 bg-muted/20 text-xs space-y-3.5">
              <span className="font-bold text-foreground block">Generate Private API Credentials</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Key Token Label</label>
                  <Input 
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="e.g. Algo-Trader-Prod"
                    required
                    className="bg-card text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block mb-1">Access Scope Permissions</label>
                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={readPerm}
                        onChange={e => setReadPerm(e.target.checked)}
                        className="w-4 h-4 cursor-pointer accent-primary"
                      />
                      <span>Read Parameters</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={writePerm}
                        onChange={e => setWritePerm(e.target.checked)}
                        className="w-4 h-4 cursor-pointer accent-primary"
                      />
                      <span>Write Executions</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setIsCreatingKey(false)} className="text-xs cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold text-white shadow">
                  Generate Key
                </Button>
              </div>
            </form>
          )}

          {/* Table list */}
          <div className="overflow-x-auto border border-border/40 rounded-lg">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent bg-muted/20">
                  <TableHead className="text-muted-foreground font-bold">Token Label</TableHead>
                  <TableHead className="text-muted-foreground font-bold">API Public Key ID</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Private Secret Token</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Scopes</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Created</TableHead>
                  <TableHead className="w-[80px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground font-medium">
                      No automated API Keys registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((key) => {
                    const isVisible = revealedSecrets[key.id] || false;
                    return (
                      <TableRow key={key.id} className="border-b border-border/20 hover:bg-card/20 transition-colors">
                        <TableCell className="font-semibold text-foreground py-3.5">{key.name}</TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <span>{key.id}</span>
                            <Button 
                              variant="ghost" 
                              size="xs" 
                              onClick={() => copyToClipboard(key.id, key.id)}
                              className="p-1 hover:bg-muted cursor-pointer h-6 w-6 rounded shrink-0"
                            >
                              {copiedKeyId === key.id ? <Check className="w-3 h-3 text-bullish" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1 font-mono text-[10px] text-foreground">
                            <span>{isVisible ? key.secret : 'ag_sk_••••••••••••••••'}</span>
                            <Button 
                              variant="ghost" 
                              size="xs" 
                              onClick={() => toggleSecretVisibility(key.id)}
                              className="p-1 hover:bg-muted cursor-pointer h-6 w-6 rounded shrink-0"
                            >
                              {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            {isVisible && (
                              <Button 
                                variant="ghost" 
                                size="xs" 
                                onClick={() => copyToClipboard(`${key.id}-sec`, key.secret)}
                                className="p-1 hover:bg-muted cursor-pointer h-6 w-6 rounded shrink-0"
                              >
                                {copiedKeyId === `${key.id}-sec` ? <Check className="w-3 h-3 text-bullish" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <Badge variant="secondary" className="text-[9px] font-bold py-0.5">
                            {key.permissions}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-3.5 font-mono text-[10px]">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => {
                              if (confirm(`CRITICAL WARNING: Terminating key "${key.name}" instantly blocks algorithms. Proceed?`)) {
                                onDeleteApiKey(key.id);
                                toast.success('API Key revoked successfully.');
                              }
                            }}
                            className="text-bearish hover:bg-bearish/10 p-1.5 cursor-pointer rounded shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Desk */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Outbound Webhook Streams
            </CardTitle>
            <CardDescription className="text-xs">Dispatch real-time event updates notifications directly to custom server URLs.</CardDescription>
          </div>
          <Button 
            onClick={() => setIsCreatingHook(!isCreatingHook)} 
            size="xs"
            className="cursor-pointer gap-1.5 text-[11px] font-bold text-white"
          >
            <Plus className="w-3.5 h-3.5" /> Configure Webhook
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          
          {/* Create Webhook Panel Form */}
          {isCreatingHook && (
            <form onSubmit={handleCreateWebhookSubmit} className="border border-border/80 rounded-xl p-4 bg-muted/20 text-xs space-y-3.5">
              <span className="font-bold text-foreground block">Add Outbound Endpoint Listener</span>
              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Endpoint Payload URL</label>
                <Input 
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  placeholder="https://yourserver.com/webhooks/listener"
                  required
                  className="bg-card text-xs h-9"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setIsCreatingHook(false)} className="text-xs cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="cursor-pointer text-xs font-bold text-white shadow">
                  Add Webhook URL
                </Button>
              </div>
            </form>
          )}

          {/* Webhooks list */}
          <div className="overflow-x-auto border border-border/40 rounded-lg">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent bg-muted/20">
                  <TableHead className="text-muted-foreground font-bold">Target Stream URL</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Signing Secret</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Subscribed Events</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Active Switch</TableHead>
                  <TableHead className="w-[80px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground font-medium">
                      No webhook listeners configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  webhooks.map((hook) => (
                    <TableRow key={hook.id} className="border-b border-border/20 hover:bg-card/20 transition-colors">
                      <TableCell className="font-semibold text-foreground py-3.5 max-w-[200px] truncate">{hook.url}</TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground py-3.5 select-all">{hook.secret}</TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {['new_login', 'withdrawal_requested'].map((ev, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[8px] font-bold uppercase tracking-wider leading-none py-1">
                              {ev.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <input 
                          type="checkbox"
                          checked={hook.status === 'Active'}
                          onChange={() => onToggleWebhook(hook.id)}
                          className="w-4 h-4 cursor-pointer accent-primary"
                        />
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <Button 
                          variant="ghost" 
                          size="xs"
                          onClick={() => {
                            if (confirm(`Confirm deletion of webhook listener: ${hook.url}?`)) {
                              onDeleteWebhook(hook.id);
                              toast.success('Webhook deleted.');
                            }
                          }}
                          className="text-bearish hover:bg-bearish/10 p-1.5 cursor-pointer rounded shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
