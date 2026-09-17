'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  TrendingUp, 
  BarChart2, 
  PieChart, 
  SlidersHorizontal, 
  User,
  Zap
} from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Trade', href: '/trading', icon: TrendingUp },
    { label: 'Markets', href: '/markets', icon: BarChart2 },
    { label: 'Portfolio', href: '/portfolio', icon: PieChart },
    { label: 'Screener', href: '/screener', icon: SlidersHorizontal },
    { label: 'Account', href: '/settings', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#08070B]/95 backdrop-blur-xl border-t border-[#23202A] px-3 py-2 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        if (item.label === 'Trade') {
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#F4511E] to-[#E65100] text-white flex items-center justify-center shadow-[0_0_20px_rgba(244,81,30,0.5)] border-2 border-[#08070B] active:scale-95 transition-transform">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <span className="text-[10px] font-bold text-[#F4511E] mt-1 font-mono">TRADE</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive ? 'text-[#F4511E]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

}
