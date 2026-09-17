'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className = '', size = 24 }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        style={{
          width: size,
          height: size,
          border: '2px solid transparent',
          borderTopColor: 'var(--color-primary, #f43f5e)',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 0.8,
        }}
      />
    </div>
  );
}

interface SkeletonLoaderProps {
  className?: string;
  rows?: number;
  height?: number;
}

export function SkeletonLoader({ className = '', rows = 3, height = 16 }: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 w-full animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-secondary/40 rounded-md w-full"
          style={{
            height,
            opacity: 1 - i * 0.15, // neat fade look
          }}
        />
      ))}
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const boundedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className={`w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${boundedProgress}%` }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
}

interface RetryComponentProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

export function RetryComponent({
  message = 'Request failed. Network connection error.',
  onRetry,
  className = '',
}: RetryComponentProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 border border-border/60 rounded-xl bg-panel text-center font-mono space-y-4 max-w-sm mx-auto ${className}`}>
      <AlertCircle className="w-8 h-8 text-rose-500 animate-bounce" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-foreground">Data Load Failure</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-secondary border border-border hover:bg-secondary/80 text-foreground font-bold rounded-lg transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Request
      </button>
    </div>
  );
}
