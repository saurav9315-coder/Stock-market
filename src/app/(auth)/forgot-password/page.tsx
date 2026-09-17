'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { Mail, Activity, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please insert a valid electronic mail address.'),
});

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    try {
      setApiError(null);
      await forgotPassword(data.email);
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || 'Forgot password request failed.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-2">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO SIGN IN
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h2>
        <p className="text-xs text-muted-foreground leading-normal">
          We will transmit authentication override instructions to your verified electronic mail coordinate.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono">
          {apiError}
        </div>
      )}

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase">Email Address</label>
          <div className="relative flex items-center border border-border rounded-lg bg-[#101424] focus-within:border-primary transition-colors px-3 py-2">
            <Mail className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email')}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full font-mono"
            />
          </div>
          {errors.email && (
            <span className="text-[10px] text-rose-500 font-mono block">{errors.email.message}</span>
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
              <span>Transmitting...</span>
            </>
          ) : (
            <span>SEND RESET INSTRUCTIONS</span>
          )}
        </button>
      </form>
    </div>
  );
}
