'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Check, 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { KycSubmission, AdminUser } from '@/lib/adminMock';

interface KycManagementViewProps {
  kyc: KycSubmission[];
  setKyc: (kyc: KycSubmission[]) => void;
  users: AdminUser[];
  setUsers: (users: AdminUser[]) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
}

export default function KycManagementView({
  kyc,
  setKyc,
  users,
  setUsers,
  logAction,
  permissions
}: KycManagementViewProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomRotation, setZoomRotation] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingItemId, setRejectingItemId] = useState<string | null>(null);

  const canModify = permissions.kyc;

  // Filtered submissions
  const filteredKyc = kyc.filter(item => {
    if (activeFilter === 'All') return true;
    return item.status === activeFilter;
  });

  const handleZoom = (imgUrl: string) => {
    setZoomedImage(imgUrl);
    setZoomScale(1);
    setZoomRotation(0);
  };

  const adjustScale = (dir: 'in' | 'out') => {
    setZoomScale(prev => {
      if (dir === 'in') return Math.min(prev + 0.25, 3);
      return Math.max(prev - 0.25, 0.5);
    });
  };

  const rotateImage = () => {
    setZoomRotation(prev => (prev + 90) % 360);
  };

  // Approve
  const handleApprove = (userId: string) => {
    if (!canModify) return toast.error('Access Denied: Support role cannot modify KYC status.');
    
    // Update KYC submission status
    const updatedKyc = kyc.map(k => {
      if (k.userId === userId) {
        return { ...k, status: 'Approved' as const, notes: undefined };
      }
      return k;
    });
    setKyc(updatedKyc);

    // Sync with User database
    const updatedUsers = users.map(u => {
      if (u.userId === userId) {
        return { ...u, kycStatus: 'Approved' as const };
      }
      return u;
    });
    setUsers(updatedUsers);

    logAction(`Approved KYC identity validation for user ID: ${userId}`);
    toast.success('KYC application cleared and approved');
  };

  // Reject
  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItemId) return;
    if (!rejectionReason.trim()) return toast.error('Please enter a reason for rejection.');

    const updatedKyc = kyc.map(k => {
      if (k.userId === rejectingItemId) {
        return { ...k, status: 'Rejected' as const, notes: rejectionReason };
      }
      return k;
    });
    setKyc(updatedKyc);

    // Sync user
    const updatedUsers = users.map(u => {
      if (u.userId === rejectingItemId) {
        return { ...u, kycStatus: 'Rejected' as const };
      }
      return u;
    });
    setUsers(updatedUsers);

    logAction(`Rejected KYC validation for user ID: ${rejectingItemId}. Reason: ${rejectionReason}`);
    toast.warning('KYC application rejected');
    setRejectingItemId(null);
    setRejectionReason('');
  };

  // Request Re-upload
  const handleRequestReupload = (userId: string) => {
    if (!canModify) return toast.error('Access Denied');
    
    const updatedKyc = kyc.map(k => {
      if (k.userId === userId) {
        return { ...k, status: 'Pending' as const, notes: 'Awaiting document re-upload. Previous images were illegible.' };
      }
      return k;
    });
    setKyc(updatedKyc);

    const updatedUsers = users.map(u => {
      if (u.userId === userId) {
        return { ...u, kycStatus: 'Pending' as const };
      }
      return u;
    });
    setUsers(updatedUsers);

    logAction(`Requested document re-upload for user ID: ${userId}`);
    toast.info('Document re-upload request logged');
  };

  return (
    <div className="space-y-6">
      {/* Filters header bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex gap-2">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map(f => {
            const count = f === 'All' ? kyc.length : kyc.filter(k => k.status === f).length;
            return (
              <Button
                key={f}
                variant={activeFilter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(f)}
                className="gap-1.5 cursor-pointer bg-card text-xs font-semibold"
              >
                {f} Documents
                <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                  activeFilter === f ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* KYC Submissions Cards */}
      {filteredKyc.length === 0 ? (
        <Card className="bg-panel border-border/80">
          <CardContent className="p-12 text-center text-muted-foreground italic flex flex-col items-center justify-center min-h-[300px]">
            <HelpCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
            No KYC applications matching the active category queue are pending.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {filteredKyc.map(item => (
            <Card key={item.userId} className="bg-panel border-border/80 shadow-md relative flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between border-b border-border pb-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {item.name}
                      <span className="text-[10px] font-mono text-muted-foreground">{item.userId}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={item.status === 'Pending' ? 'secondary' : item.status === 'Approved' ? 'default' : 'destructive'} className="text-[10px] py-0 font-bold uppercase tracking-wider font-mono">
                      {item.status}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-mono">{new Date(item.submittedAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Document parameters */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-muted/20 border border-border/60 rounded p-3 font-medium">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Document Type</span>
                    <span className="text-foreground flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                      {item.documentType}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Document Identifier</span>
                    <span className="text-foreground font-mono">{item.documentNumber}</span>
                  </div>
                  {item.notes && (
                    <div className="col-span-2 border-t border-border/60 pt-2 text-bearish flex items-start gap-1">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{item.notes}</span>
                    </div>
                  )}
                </div>

                {/* Previews */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Front Cover Page</span>
                    <div 
                      onClick={() => handleZoom(item.frontPageUrl)}
                      className="border border-border/80 rounded-lg overflow-hidden bg-card h-32 flex items-center justify-center cursor-zoom-in relative group"
                    >
                      <img src={item.frontPageUrl} alt="Front ID" className="object-contain h-full w-full p-2 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs gap-1 font-semibold">
                        <ZoomIn className="w-4 h-4" /> Full View
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Back / Profile Page</span>
                    <div 
                      onClick={() => handleZoom(item.backPageUrl)}
                      className="border border-border/80 rounded-lg overflow-hidden bg-card h-32 flex items-center justify-center cursor-zoom-in relative group"
                    >
                      <img src={item.backPageUrl} alt="Back ID" className="object-contain h-full w-full p-2 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs gap-1 font-semibold">
                        <ZoomIn className="w-4 h-4" /> Full View
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                {item.status === 'Pending' && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRequestReupload(item.userId)}
                      className="text-xs gap-1.5 cursor-pointer hover:bg-muted"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-upload
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setRejectingItemId(item.userId)}
                      className="text-bearish border-bearish/30 hover:bg-bearish/10 text-xs gap-1.5 cursor-pointer bg-card"
                    >
                      <X className="w-3.5 h-3.5" /> Reject Identity
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(item.userId)}
                      className="text-white bg-primary text-xs gap-1.5 cursor-pointer font-bold shadow-md hover:opacity-90"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve KYC
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingItemId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleRejectSubmit}
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5 text-bearish">
                <AlertCircle className="w-4 h-4 text-bearish" /> Reject KYC Submission
              </h3>
              <button 
                type="button" 
                onClick={() => setRejectingItemId(null)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Provide detailed remarks specifying why this customer's identification papers were rejected. This note is shared with the client.
              </p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Image resolution was illegible. Or Passport expiration exceeds sandbox limits."
                rows={3}
                required
                className="w-full bg-card border border-border rounded p-2 text-xs text-foreground outline-none resize-none focus:border-primary/50"
              />
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
              <Button type="button" variant="ghost" size="sm" onClick={() => setRejectingItemId(null)} className="cursor-pointer text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-destructive hover:bg-destructive/95 cursor-pointer text-xs font-bold text-white">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* DOCUMENT PREVIEW LIGHTBOX ZOOM */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          {/* Top Control Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-4 text-white z-50">
            <span className="text-xs font-bold tracking-widest font-mono uppercase text-muted-foreground">Document Lightbox Magnifier</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => adjustScale('out')} className="text-white border-white/20 hover:bg-white/10 cursor-pointer p-2">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs font-bold font-mono px-2">{(zoomScale * 100).toFixed(0)}%</span>
              <Button variant="outline" size="sm" onClick={() => adjustScale('in')} className="text-white border-white/20 hover:bg-white/10 cursor-pointer p-2">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={rotateImage} className="text-white border-white/20 hover:bg-white/10 cursor-pointer p-2 gap-1.5 text-xs">
                <RotateCw className="w-4 h-4" /> Rotate
              </Button>
              <Button size="sm" onClick={() => setZoomedImage(null)} className="bg-white hover:bg-white/90 text-black font-bold cursor-pointer text-xs">
                Close Viewer
              </Button>
            </div>
          </div>

          {/* Interactive Image Display Wrapper */}
          <div className="relative flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden border border-white/10 rounded-xl bg-black/40">
            <div 
              style={{
                transform: `scale(${zoomScale}) rotate(${zoomRotation}deg)`,
                transition: 'transform 0.25s ease-out'
              }}
              className="max-h-[70vh] max-w-[80vw]"
            >
              <img src={zoomedImage} alt="Zoomed ID doc" className="object-contain max-h-[70vh] max-w-[80vw]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
