'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Activity } from 'lucide-react';

const verify2faSchema = z.object({
  code: z.string().length(6, '2FA code must be exactly 6 characters.'),
});

type TwoFactorFormValues = z.infer<typeof verify2faSchema>;

export default function Verify2faPage() {
  const { verify2fa } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(verify2faSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: TwoFactorFormValues) => {
    try {
      setApiError(null);
      await verify2fa(data.code);
    } catch (err) {
      const error = err as Error;
      setApiError(error.message || '2FA code failed. Try code "123456".');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Two-Factor Authentication</h2>
        <p className="text-xs text-muted-foreground leading-normal">
          Enter the 6-digit verification code from your authenticator application (e.g. Google Authenticator) to authorize your trader session.
        </p>
      </div>

      {apiError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-mono">
          {apiError}
        </div>
      )}

      {/* Verify 2FA Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Code Field */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold font-mono text-muted-foreground uppercase">Authenticator Code</label>
          <div className="relative flex items-center border border-border rounded-lg bg-[#101424] focus-within:border-primary transition-colors px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              {...register('code')}
              className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-full font-mono tracking-widest text-center"
            />
          </div>
          {errors.code && (
            <span className="text-[10px] text-rose-500 font-mono block">{errors.code.message}</span>
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
              <span>Authorizing...</span>
            </>
          ) : (
            <span>AUTHORIZE KEY SIGNATURE</span>
          )}
        </button>
      </form>

      <p className="text-[11px] text-center text-muted-foreground font-mono">
        Hint: For simulation testing, enter code <span className="text-primary font-bold">123456</span>.
      </p>
    </div>
  );
}
