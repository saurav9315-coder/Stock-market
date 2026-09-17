'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Lock, Eye, EyeOff, Activity } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match.',
  path: ['confirmPassword'],
});

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Password strength calculation
  const [passwordValue, setPasswordValue] = useState('');
  const [strength, setStrength] = useState<{ score: number; label: string; color: string }>({
    score: 0,
    label: 'None',
    color: 'bg-muted/30'
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  useEffect(() => {
    setPasswordValue(watchedPassword || '');
  }, [watchedPassword]);

  useEffect(() => {
    if (!passwordValue) {
      setStrength({ score: 0, label: 'None', color: 'bg-muted/30' });
      return;
    }

    let score = 0;
    if (passwordValue.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordValue)) score += 1;
    if (/[0-9]/.test(passwordValue)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score === 3) {
      label = 'Medium';
      color = 'bg-amber-500';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }

    setStrength({ score, label, color });
  }, [passwordValue]);

  const onSubmit = async (data: ResetFormValues) => {
    try {
      setApiError(null);
      await resetPassword(data.password);
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || 'Failed to override secret keys.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Set New Password</h2>
        <p className="text-xs text-muted-foreground leading-normal">
          Update the security passphrase for your sandbox keys.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono">
          {apiError}
        </div>
      )}

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase">New Password</label>
          <div className="relative flex items-center border border-border rounded-lg bg-[#101424] focus-within:border-primary transition-colors px-3 py-2">
            <Lock className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-0.5 rounded text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[10px] text-rose-500 font-mono block">{errors.password.message}</span>
          )}

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-muted-foreground font-bold">STRENGTH:</span>
                <span className={strength.score >= 4 ? 'text-emerald-500 font-bold' : strength.score === 3 ? 'text-amber-500 font-bold' : 'text-rose-500 font-bold'}>
                  {strength.label.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1">
                <div className={`h-full rounded-full transition-colors ${strength.score >= 1 ? strength.color : 'bg-muted/20'}`} />
                <div className={`h-full rounded-full transition-colors ${strength.score >= 2 ? strength.color : 'bg-muted/20'}`} />
                <div className={`h-full rounded-full transition-colors ${strength.score >= 3 ? strength.color : 'bg-muted/20'}`} />
                <div className={`h-full rounded-full transition-colors ${strength.score >= 4 ? strength.color : 'bg-muted/20'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase">Confirm Password</label>
          <div className="relative flex items-center border border-border rounded-lg bg-[#101424] focus-within:border-primary transition-colors px-3 py-2">
            <Lock className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full font-mono"
            />
          </div>
          {errors.confirmPassword && (
            <span className="text-[10px] text-rose-500 font-mono block">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-white" />
              <span>Updating secrets...</span>
            </>
          ) : (
            <span>RESET SECURITY PASSPHRASE</span>
          )}
        </button>
      </form>
    </div>
  );
}
