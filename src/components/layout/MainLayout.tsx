'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import TickerTape from './TickerTape';
import MobileBottomNav from './MobileBottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const authRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/verify-otp',
    '/verify-2fa',
    '/session-expired',
    '/account-locked',
  ];
  const isAuthRoute = authRoutes.includes(pathname);
  const isLandingRoute = pathname === '/';
  const isStandaloneRoute = isLandingRoute || isAuthRoute;

  if (isStandaloneRoute) {
    return (
      <div className="w-full max-w-full min-h-screen bg-[#05070A] text-[#F8FAFC]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex w-full h-[100dvh] overflow-hidden bg-[#05070A]">
      {/* Sidebar - handles both desktop aside and mobile drawer */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Right Main Panel */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden bg-[#05070A] min-w-0 max-w-full">
        {/* Ticker tape */}
        <TickerTape />

        {/* Top Header Navigation */}
        <Header onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
