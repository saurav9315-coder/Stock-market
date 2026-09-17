'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Laptop, 
  Smartphone, 
  Trash2, 
  ShieldCheck, 
  MapPin, 
  UserMinus,
  Edit2,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { DeviceSession } from '@/lib/profileMock';

interface SessionsDevicesProps {
  devices: DeviceSession[];
  onLogoutDevice: (id: string) => void;
  onLogoutAllDevices: () => void;
  logAction: (action: string) => void;
}

export default function SessionsDevices({
  devices,
  onLogoutDevice,
  onLogoutAllDevices,
  logAction
}: SessionsDevicesProps) {
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [renamedName, setRenamedName] = useState('');

  // Trusted Devices list local mock state
  const [trustedDevices, setTrustedDevices] = useState<Array<{ id: string; name: string; type: 'Desktop' | 'Mobile'; addedAt: string }>>([
    { id: 'dev-01', name: 'Workstation Chrome (New York)', type: 'Desktop', addedAt: '2026-07-01T12:00:00Z' },
    { id: 'dev-02', name: 'iPhone 15 Pro Node', type: 'Mobile', addedAt: '2026-07-10T15:30:00Z' }
  ]);

  const handleRenameDevice = (id: string, name: string) => {
    setEditingDeviceId(id);
    setRenamedName(name);
  };

  const handleSaveRename = (id: string) => {
    if (!renamedName.trim()) return toast.error('Device name cannot be blank');
    setTrustedDevices(trustedDevices.map(d => d.id === id ? { ...d, name: renamedName } : d));
    setEditingDeviceId(null);
    logAction(`Renamed trusted device identifier to: ${renamedName}`);
    toast.success('Device identifier updated');
  };

  const handleRevokeTrusted = (id: string, name: string) => {
    setTrustedDevices(trustedDevices.filter(d => d.id !== id));
    logAction(`Revoked authorization trust parameters for device: ${name}`);
    toast.warning('Trusted device revoked successfully');
  };

  const handleTrustCurrentSession = (device: DeviceSession) => {
    const isAlreadyTrusted = trustedDevices.some(d => d.name.toLowerCase().includes(device.deviceName.toLowerCase()));
    if (isAlreadyTrusted) {
      return toast.info('Device session is already trusted.');
    }
    const newTrusted = {
      id: `dev-${Date.now()}`,
      name: `${device.deviceName} (${device.browser})`,
      type: device.os.toLowerCase().includes('ios') || device.os.toLowerCase().includes('android') ? 'Mobile' as const : 'Desktop' as const,
      addedAt: new Date().toISOString()
    };
    setTrustedDevices([...trustedDevices, newTrusted]);
    logAction(`Marked active device session ${device.deviceName} as trusted.`);
    toast.success(`Marked device session as trusted`);
  };

  return (
    <div className="space-y-6">
      {/* Active Sessions Panel */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Laptop className="w-4 h-4 text-primary" /> Active Device Sessions
            </CardTitle>
            <CardDescription className="text-xs">Logged-in systems authorized to inspect trading terminals and assets.</CardDescription>
          </div>
          {devices.length > 1 && (
            <Button 
              variant="outline" 
              size="xs"
              onClick={() => {
                if (confirm('Are you sure you want to terminate all other active session nodes?')) {
                  onLogoutAllDevices();
                  toast.success('Terminated other active sessions.');
                }
              }}
              className="text-bearish hover:bg-bearish/10 border-bearish/30 cursor-pointer shrink-0 text-[10px] gap-1.5 font-bold flex items-center"
            >
              <UserMinus className="w-3.5 h-3.5" /> Terminate Other Sessions
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="w-[200px] text-muted-foreground font-bold">Device Node</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Operating System</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Country / IP Address</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Recent Activity</TableHead>
                  <TableHead className="text-muted-foreground font-bold">Authorization Status</TableHead>
                  <TableHead className="w-[120px] text-right text-muted-foreground font-bold"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => {
                  const isMobile = device.os.toLowerCase().includes('ios') || device.os.toLowerCase().includes('android');
                  return (
                    <TableRow key={device.id} className="border-b border-border/20 hover:bg-card/20 transition-colors">
                      <TableCell className="font-semibold text-foreground py-3.5 flex items-center gap-2">
                        {isMobile ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <Laptop className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="space-y-0.5">
                          <span className="block font-bold">{device.deviceName}</span>
                          <span className="text-[10px] text-muted-foreground block">{device.browser}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3.5 font-mono">{device.os}</TableCell>
                      <TableCell className="text-muted-foreground py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>New York, USA</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">{device.ipAddress}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-3.5 font-mono">
                        {device.current ? 'Current Active Node' : device.loginTime}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {device.current ? (
                          <Badge className="bg-bullish/15 text-bullish border-bullish/30 text-[9px] font-bold">CURRENT SESSION</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] font-bold">AUTHORIZATION ACTIVE</Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          {!device.current && (
                            <Button 
                              variant="ghost" 
                              size="xs"
                              onClick={() => {
                                onLogoutDevice(device.id);
                                toast.success(`Revoked authorization for ${device.deviceName}`);
                              }}
                              className="text-bearish hover:bg-bearish/10 text-[10px] cursor-pointer font-bold px-2 flex items-center"
                            >
                              Revoke
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => handleTrustCurrentSession(device)}
                            className="text-primary hover:bg-primary/5 text-[9px] cursor-pointer font-bold px-2 flex items-center"
                          >
                            Trust
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trusted Devices Management */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-3 p-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Remembered & Trusted Devices
          </CardTitle>
          <CardDescription className="text-xs">Systems bypass multi-factor checks on secondary sign-ins.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          {trustedDevices.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-border/40 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-muted-foreground/60 mx-auto mb-2" />
              <span className="text-xs text-muted-foreground block">No trusted devices registered.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustedDevices.map((device) => (
                <div key={device.id} className="border border-border/60 rounded-xl p-3.5 bg-card/20 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      {device.type === 'Mobile' ? (
                        <Smartphone className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Laptop className="w-4 h-4 text-primary shrink-0" />
                      )}
                      
                      {editingDeviceId === device.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={renamedName}
                            onChange={e => setRenamedName(e.target.value)}
                            className="h-7 text-xs bg-card w-36 px-2 py-1"
                            required
                          />
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => handleSaveRename(device.id)}
                            className="p-1 cursor-pointer hover:bg-muted text-bullish shrink-0"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs"
                            onClick={() => setEditingDeviceId(null)}
                            className="p-1 cursor-pointer hover:bg-muted text-bearish shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground block truncate max-w-[150px]">{device.name}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      Added: {new Date(device.addedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {editingDeviceId !== device.id && (
                      <Button 
                        variant="ghost" 
                        size="xs"
                        onClick={() => handleRenameDevice(device.id, device.name)}
                        className="p-1.5 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="xs"
                      onClick={() => handleRevokeTrusted(device.id, device.name)}
                      className="p-1.5 cursor-pointer hover:bg-muted text-bearish/80 hover:text-bearish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
