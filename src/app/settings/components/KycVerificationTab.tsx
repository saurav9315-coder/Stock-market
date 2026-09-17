import React, { useState } from 'react';
import { UserProfile } from '@/lib/profileMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Upload, 
  User, 
  FileText, 
  Shield, 
  Camera, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Building,
  UserCheck,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface KycVerificationTabProps {
  profile: UserProfile;
  onUpdateStatus: (status: UserProfile['kycStatus']) => void;
}

export default function KycVerificationTab({ profile, onUpdateStatus }: KycVerificationTabProps) {
  const [step, setStep] = useState<number>(1);
  const [idType, setIdType] = useState<string>('Passport');
  
  // Document Upload States
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<boolean>(false);
  const [isScanningSelfie, setIsScanningSelfie] = useState<boolean>(false);
  
  const [addressDoc, setAddressDoc] = useState<File | null>(null);
  const [addressDocType, setAddressDocType] = useState<string>('Bank Statement');

  // Submit flow
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelfieScan = () => {
    setIsScanningSelfie(true);
    toast.info("Initializing biometrics hardware scanner node...");
    
    setTimeout(() => {
      setSelfie(true);
      setIsScanningSelfie(false);
      toast.success("Selfie face match scan matching score: 98.4% (SUCCESS)");
    }, 2800);
  };

  const handleDocUpload = (file: File, type: 'front' | 'back' | 'address') => {
    if (file.size > 1024 * 1024) {
      toast.error("File exceeds 1MB. Please upload a smaller mockup proof.");
      return;
    }
    if (type === 'front') setIdFront(file);
    if (type === 'back') setIdBack(file);
    if (type === 'address') setAddressDoc(file);
    toast.success("Document attached successfully.");
  };

  const handleSubmitKyc = () => {
    if (!idFront || !idBack) {
      toast.error("Please upload both front and back sides of your ID.");
      return;
    }
    if (!selfie) {
      toast.error("Please complete the selfie verification scan step.");
      return;
    }
    if (!addressDoc) {
      toast.error("Please upload address proof document.");
      return;
    }

    setIsSubmitting(true);
    toast.info("Compressing credentials packages and transmitting to compliance engine...");

    setTimeout(() => {
      onUpdateStatus('Under Review');
      setIsSubmitting(false);
      toast.success("KYC documents submitted successfully! Compliance team is auditing details.");
    }, 2500);
  };

  const getKycIcon = (status: UserProfile['kycStatus']) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />;
      case 'Under Review':
        return <RefreshCw className="w-12 h-12 text-amber-400 mx-auto animate-spin" />;
      case 'Rejected':
        return <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />;
      default:
        return <Shield className="w-12 h-12 text-indigo-400 mx-auto" />;
    }
  };

  const getStepClass = (currentStep: number) => {
    if (step > currentStep) return 'bg-emerald-500 text-white border-emerald-500';
    if (step === currentStep) return 'bg-primary text-white border-primary';
    return 'bg-panel border-border text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* 1. KYC State Header Banner */}
      <div className="rounded-xl border border-panel-border bg-card p-6 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-emerald-500" />
        
        {getKycIcon(profile.kycStatus)}

        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            Identity Verification Status: {profile.kycStatus.toUpperCase()}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {profile.kycStatus === 'Approved' && "Your account is fully compliant. Global trading, limits, and cash outs are active."}
            {profile.kycStatus === 'Under Review' && "Documents successfully uploaded. Audit checks generally conclude within 10-30 minutes."}
            {profile.kycStatus === 'Rejected' && "Rejection reasons logged by auditor. Please audit fields or re-upload documents."}
            {profile.kycStatus === 'Pending' && "Complete identity verification to lift regulatory thresholds and unlock withdrawals."}
          </p>
        </div>

        {/* Auditor Sandbox override toggle buttons */}
        <div className="pt-2 border-t border-border/20 flex justify-center items-center gap-2">
          <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase mr-2">Developer Override:</span>
          <button
            onClick={() => onUpdateStatus('Approved')}
            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[9px] font-mono rounded border border-emerald-500/20 cursor-pointer"
          >
            APPROVE KYC
          </button>
          <button
            onClick={() => onUpdateStatus('Rejected')}
            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[9px] font-mono rounded border border-rose-500/20 cursor-pointer"
          >
            REJECT KYC
          </button>
          <button
            onClick={() => onUpdateStatus('Pending')}
            className="px-2.5 py-1 bg-secondary hover:bg-muted text-foreground font-bold text-[9px] font-mono rounded border border-border cursor-pointer"
          >
            RESET
          </button>
        </div>
      </div>

      {/* 2. KYC Stepper Wizard (only if Pending or Rejected) */}
      {(profile.kycStatus === 'Pending' || profile.kycStatus === 'Rejected') && (
        <div className="rounded-xl border border-panel-border bg-card p-6 shadow-sm space-y-8">
          {/* Stepper Header indicator */}
          <div className="flex items-center justify-center max-w-lg mx-auto relative select-none">
            <div className="absolute left-4 right-4 h-0.5 bg-border z-0" />
            
            {[
              { num: 1, label: 'Legal Info' },
              { num: 2, label: 'ID Documents' },
              { num: 3, label: 'Proof of Residence' }
            ].map((s) => (
              <div key={s.num} className="flex-1 flex flex-col items-center justify-center relative z-10">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-all ${getStepClass(s.num)}`}>
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-1.5 font-mono uppercase bg-card px-2">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Stepper Page Body */}
          <div className="border-t border-border/30 pt-6">
            {/* Step 1: Legal Information verify */}
            {step === 1 && (
              <div className="space-y-5 text-left">
                <div className="flex gap-3.5 p-3.5 bg-indigo-500/5 border border-indigo-500/15 rounded-lg text-xs leading-relaxed">
                  <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    Please ensure your legal name matches your document inputs. Current profile attributes logged:
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs p-4 bg-panel/30 border border-border/30 rounded-lg">
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-mono tracking-wider">Full Legal Name</span>
                    <span className="text-foreground font-semibold block mt-0.5">{profile.firstName} {profile.lastName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-mono tracking-wider">Date of Birth</span>
                    <span className="text-foreground font-semibold block font-mono mt-0.5">{profile.dob}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-mono tracking-wider">Nationality</span>
                    <span className="text-foreground font-semibold block mt-0.5">{profile.nationality}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px] uppercase font-mono tracking-wider">Permanent Address</span>
                    <span className="text-foreground font-semibold block mt-0.5 truncate">{profile.address}, {profile.city}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Document uploads */}
            {step === 2 && (
              <div className="space-y-6 text-left">
                {/* ID Type selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Select Identity Document Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {['Passport', 'Aadhaar', 'PAN Card', 'Driving License', 'National ID'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setIdType(t); setIdFront(null); setIdBack(null); }}
                        className={`px-2 py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          idType === t 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border bg-panel hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload drag zones */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                      {idType} Front Side
                    </span>
                    <label className="border-2 border-dashed border-border hover:border-border/80 bg-panel/30 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer min-h-[120px]">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], 'front')} 
                      />
                      {idFront ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{idFront.name}</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-xs">
                          <Upload className="w-5 h-5 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground text-[10px]">Upload front side</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                      {idType} Back Side
                    </span>
                    <label className="border-2 border-dashed border-border hover:border-border/80 bg-panel/30 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer min-h-[120px]">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], 'back')} 
                      />
                      {idBack ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{idBack.name}</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-xs">
                          <Upload className="w-5 h-5 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground text-[10px]">Upload back side</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Selfie check */}
                <div className="border-t border-border/30 pt-5 space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider block">
                    Step 2B: Liveness Face Match Verification
                  </span>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-panel/40 border border-border/30 p-4 rounded-lg">
                    <div className="w-16 h-16 rounded-full border border-border/80 bg-[#07090f] flex items-center justify-center overflow-hidden shrink-0 relative">
                      {selfie ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      ) : isScanningSelfie ? (
                        <div className="w-full h-full bg-primary/20 border-t-2 border-primary animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="space-y-1 text-center sm:text-left flex-1">
                      <span className="text-xs font-bold text-foreground block">Face Detection Scanner</span>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Matches your device live face scan against your uploaded identity documents to prevent spoofing.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSelfieScan}
                      disabled={isScanningSelfie || selfie}
                      className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-[10px] font-mono rounded cursor-pointer transition-all disabled:opacity-50 shrink-0"
                    >
                      {selfie ? 'VERIFIED' : isScanningSelfie ? 'SCANNING...' : 'START FACE SCAN'}
                    </button>
                  </div>
                </div>

                {/* Back / Next buttons */}
                <div className="flex justify-between pt-4 border-t border-border/30">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2 border border-border bg-panel text-foreground font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!idFront || !idBack) {
                        toast.error("Please upload front and back of document.");
                        return;
                      }
                      if (!selfie) {
                        toast.error("Liveness facial scan required.");
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Proceed to Step 3
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Address Proof */}
            {step === 3 && (
              <div className="space-y-6 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    Select Utility / Address Document Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Utility Bill', 'Bank Statement', 'Government Document'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setAddressDocType(t); setAddressDoc(null); }}
                        className={`px-2 py-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                          addressDocType === t 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-border bg-panel hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
                    Upload {addressDocType} Proof
                  </span>
                  <label className="border-2 border-dashed border-border hover:border-border/80 bg-panel/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,application/pdf" 
                      onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], 'address')} 
                    />
                    {addressDoc ? (
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <span>{addressDoc.name}</span>
                      </div>
                    ) : (
                      <div className="text-center space-y-2 text-xs">
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground text-[10px]">Drag or choose statement proof PDF/Image</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex justify-between pt-4 border-t border-border/30">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2 border border-border bg-panel text-foreground font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitKyc}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg cursor-pointer disabled:opacity-75"
                  >
                    {isSubmitting ? 'Transmitting data...' : 'Submit Verification Pack'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
