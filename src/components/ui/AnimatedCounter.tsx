'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: string; // e.g. "1.8ms", "$12.4T", "99.99%", "94.2%"
  className?: string;
  duration?: number; // duration in ms
}

export default function AnimatedCounter({ value, className = '', duration = 1500 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState<string>('0');

  useEffect(() => {
    if (!isInView) return;

    // Parse prefix, number, decimals, and suffix
    // Matches e.g. "$", "12.4", "T" or "", "1.8", "ms" or "", "99.99", "%"
    const match = value.match(/^([^0-9.-]*)([0-9.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || '';
    const targetNum = parseFloat(match[2]);
    const suffix = match[3] || '';
    const decimals = (match[2].split('.')[1] || '').length;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = easeProgress * targetNum;

      setDisplayValue(`${prefix}${currentNum.toFixed(decimals)}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value); // Ensure exact target string at the end
      }
    };

    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref} className={className}>{displayValue}</span>;
}
