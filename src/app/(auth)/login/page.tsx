'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Mail, Activity, AlertCircle, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address (e.g., trader@quant.com)'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setApiError(null);
      await login(data.email, data.password, data.rememberMe);
    } catch (err: any) {
      const errorMsg = err?.message || err?.data?.message || 'Invalid email or password. Please verify your credentials.';
      setApiError(errorMsg);
      toast.error('Authentication Failed', {
        description: errorMsg,
      });
    }
  };

  const handleDemoLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue('email', 'sandbox@quant.com', { shouldValidate: true });
    setValue('password', 'quant2026', { shouldValidate: true });
    toast.info('Demo Trader Credentials Filled', {
      description: 'Logging into simulated trader environment...',
    });
    onSubmit({
      email: 'sandbox@quant.com',
      password: 'quant2026',
      rememberMe: true,
    });
  };

  const handleAdminLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue('email', 'admin@quant.com', { shouldValidate: true });
    setValue('password', 'admin2026', { shouldValidate: true });
    toast.info('Admin Credentials Configured', {
      description: 'Signing into Executive Operations Console...',
    });
    onSubmit({
      email: 'admin@quant.com',
      password: 'admin2026',
      rememberMe: true,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-stylish">Sign In</h2>
        <p className="text-xs text-muted-foreground leading-normal">
          Provide your credentials to access trading terminals or administrative controls.
        </p>
      </div>

      {/* High-Visibility Error Banner */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-rose-950/40">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-rose-400 block uppercase tracking-wider text-[10px]">Access Denied</span>
            <span>{apiError}</span>
          </div>
        </div>
      )}

      {/* 1-Tap Quick Demo Login Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleAdminLogin}
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/15 border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-white hover:bg-amber-500/30 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>⚡ ADMIN EXECUTIVE LOGIN</span>
        </button>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D84315]/15 to-[#FF7043]/15 border border-[#FF7043]/40 hover:border-[#FF7043] text-[#FF7043] hover:text-white hover:bg-[#D84315]/30 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current text-[#FF7043] shrink-0" />
          <span>⚡ DEMO TRADER LOGIN</span>
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase">Email Address</label>
            {errors.email && (
              <span className="text-[10px] text-rose-400 font-mono font-bold">{errors.email.message}</span>
            )}
          </div>
          <div className={`relative flex items-center border rounded-xl bg-[#0E0D12] transition-colors px-3 py-2.5 shadow-inner ${
            errors.email 
              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-500/5' 
              : 'border-border focus-within:border-primary'
          }`}>
            <Mail className={`w-4 h-4 mr-2 shrink-0 ${errors.email ? 'text-rose-400' : 'text-muted-foreground'}`} />
            <input
              type="email"
              placeholder="trader@quant.com"
              {...register('email')}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 w-full font-mono"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase">Password</label>
            <Link href="/forgot-password" className="text-[10px] font-mono text-primary hover:underline">
              Forgot Secret?
            </Link>
          </div>
          <div className={`relative flex items-center border rounded-xl bg-[#0E0D12] transition-colors px-3 py-2.5 shadow-inner ${
            errors.password 
              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-500/5' 
              : 'border-border focus-within:border-primary'
          }`}>
            <Lock className={`w-4 h-4 mr-2 shrink-0 ${errors.password ? 'text-rose-400' : 'text-muted-foreground'}`} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 w-full font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-[#FF7043]" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[10px] text-rose-400 font-mono font-bold block">{errors.password.message}</span>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="rememberMe"
            {...register('rememberMe')}
            className="rounded border-border bg-[#0E0D12] text-primary focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer select-none">
            Keep sandbox credentials cached (Remember Me)
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl btn-primary-glow text-white font-bold text-xs shadow-lg shadow-[#F4511E]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer tracking-wider active:scale-98 min-h-[44px]"
        >
          {isSubmitting ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-white" />
              <span>AUTHENTICATING ACCESS...</span>
            </>
          ) : (
            <span>ACCESS PLATFORM</span>
          )}
        </button>
      </form>

      {/* Social Logins */}
      <div className="space-y-3 pt-4 border-t border-border/20">
        <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase text-center block">
          OR QUICK-CONNECT VIA
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="flex items-center justify-center py-2.5 rounded-xl border border-border bg-[#0E0D12] hover:bg-[#16141F] hover:border-primary/40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground active:scale-95 min-h-[40px]"
            title="Sign in with Google Simulation"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.829-6.357-6.32s2.848-6.32 6.357-6.32c1.722 0 3.284.685 4.437 1.8l3.197-3.17C19.539 2.502 16.14 1 12.24 1 6.033 1 1 5.925 1 12s5.033 11 11.24 11c6.516 0 11.24-4.52 11.24-11 0-.745-.083-1.47-.236-2.185H12.24z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="flex items-center justify-center py-2.5 rounded-xl border border-border bg-[#0E0D12] hover:bg-[#16141F] hover:border-primary/40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground active:scale-95 min-h-[40px]"
            title="Sign in with GitHub Simulation"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="flex items-center justify-center py-2.5 rounded-xl border border-border bg-[#0E0D12] hover:bg-[#16141F] hover:border-primary/40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground active:scale-95 min-h-[40px]"
            title="Sign in with Apple Simulation"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sign Up Redirect */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        New candidate?{' '}
        <Link href="/register" className="font-bold text-primary hover:underline">
          Request Sandbox Seat
        </Link>
      </p>
    </div>
  );
}
