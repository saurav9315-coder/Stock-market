import React, { useRef } from 'react';
import { UserProfile } from '@/lib/profileMock';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Edit3, 
  Download, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileOverviewTabProps {
  profile: UserProfile;
  onUpdatePhoto: (url: string) => void;
  onRemovePhoto: () => void;
  onNavigateTab: (tabId: string) => void;
}

export default function ProfileOverviewTab({
  profile,
  onUpdatePhoto,
  onRemovePhoto,
  onNavigateTab
}: ProfileOverviewTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdatePhoto(reader.result as string);
        toast.success("Profile photo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerDownloadReport = () => {
    toast.info("Compiling quantitative profile metadata audit...");
    const content = `StockInside Trading Platform - Account Report\n` +
      `Date Generated: ${new Date().toLocaleString()}\n\n` +
      `User ID: ${profile.userId}\n` +
      `Name: ${profile.firstName} ${profile.lastName}\n` +
      `Username: ${profile.username}\n` +
      `Email: ${profile.email}\n` +
      `Phone: ${profile.phone}\n` +
      `Joined Date: ${profile.joinedDate}\n` +
      `Account Type: ${profile.accountType}\n` +
      `KYC Status: ${profile.kycStatus}\n` +
      `Preferred Currency: ${profile.currency}\n` +
      `Nationality: ${profile.nationality}\n` +
      `Occupation: ${profile.occupation}\n` +
      `Address: ${profile.address}, ${profile.city}, ${profile.state}, ${profile.country} - ${profile.postalCode}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Account_Report_${profile.userId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Account configuration report downloaded.");
  };

  const getKycBadgeClass = (status: UserProfile['kycStatus']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Avatar Card Panel */}
      <div className="rounded-xl border border-panel-border bg-card p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-primary/5 blur-[40px] group-hover:scale-110 transition-transform duration-500" />
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Area */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-border/80 bg-panel flex items-center justify-center relative">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            
            {/* Overlay Camera Buttons */}
            <div className="absolute -bottom-1 -right-1 flex gap-1 bg-background rounded-full border border-border p-1 shadow-md">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-muted text-foreground rounded-full transition-colors cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              {profile.profilePhoto && (
                <button 
                  onClick={onRemovePhoto}
                  className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-full transition-colors cursor-pointer"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User Meta */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h2 className="text-xl font-extrabold text-foreground">{profile.firstName} {profile.lastName}</h2>
              <span className={`self-center px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border ${getKycBadgeClass(profile.kycStatus)}`}>
                KYC {profile.kycStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">ID: {profile.userId} • username: @{profile.username}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {profile.accountType}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city}, {profile.country}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined {profile.joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Contact Credentials</h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="w-4 h-4" /> Email Address</span>
              <span className="text-foreground font-semibold">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="w-4 h-4" /> Phone Number</span>
              <span className="text-foreground font-mono font-semibold">{profile.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Preferred Currency</span>
              <span className="text-foreground font-mono font-semibold">{profile.currency}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-xl border border-panel-border bg-card p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Quick Action Desk</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateTab('info')}
              className="py-2.5 px-3 border border-border bg-panel hover:bg-muted text-foreground font-bold text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-4 h-4 text-primary" />
              Edit Profile
            </button>
            
            {profile.kycStatus !== 'Approved' ? (
              <button
                onClick={() => onNavigateTab('kyc')}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-500/90 text-white font-bold text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify KYC
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('kyc')}
                className="py-2.5 px-3 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                KYC Completed
              </button>
            )}

            <button
              onClick={() => onNavigateTab('security')}
              className="py-2.5 px-3 border border-border bg-panel hover:bg-muted text-foreground font-bold text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              Change Password
            </button>

            <button
              onClick={triggerDownloadReport}
              className="py-2.5 px-3 border border-border bg-panel hover:bg-muted text-foreground font-bold text-[11px] rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Account Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
