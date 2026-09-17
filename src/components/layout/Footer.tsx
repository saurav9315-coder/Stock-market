'use client';

import React from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  MessageSquare
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#05070A] border-t border-[#1E293B] text-[#94A3B8] pt-16 pb-12 px-4 md:px-8 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Upper Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#F4511E]/10 border border-[#F4511E]/30 flex items-center justify-center text-[#F4511E] group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-[#F8FAFC] font-stylish">
                  STOCKINSIDE<span className="text-[#F4511E]">.TRADING</span>
                </span>
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-mono">
                  Enterprise Trading Terminal
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#94A3B8] max-w-sm leading-relaxed">
              Institutional-grade cryptocurrency & multi-asset quantitative trading platform. Engineered for ultra-low latency execution, real-time analytics, and advanced algorithmic order routing.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-[#0B0F14] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#F4511E] hover:border-[#F4511E]/40 transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="GitHub" className="w-9 h-9 rounded-lg bg-[#0B0F14] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#F4511E] hover:border-[#F4511E]/40 transition-colors">
                <GithubIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-[#0B0F14] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#F4511E] hover:border-[#F4511E]/40 transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Discord" className="w-9 h-9 rounded-lg bg-[#0B0F14] border border-[#1E293B] flex items-center justify-center text-[#94A3B8] hover:text-[#F4511E] hover:border-[#F4511E]/40 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products Column */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8FAFC]">Products</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/trading" className="hover:text-[#F4511E] transition-colors">Spot Trading</Link></li>
              <li><Link href="/trading" className="hover:text-[#F4511E] transition-colors flex items-center gap-1.5">Futures Trading <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F4511E]/10 text-[#F4511E] font-mono">100x</span></Link></li>
              <li><Link href="/screener" className="hover:text-[#F4511E] transition-colors">Quant Screener</Link></li>
              <li><Link href="/ai-analysis" className="hover:text-[#F4511E] transition-colors">AI Analytics</Link></li>
              <li><Link href="/portfolio" className="hover:text-[#F4511E] transition-colors">Portfolio Desk</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8FAFC]">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">Careers</Link></li>
              <li><Link href="/security" className="hover:text-[#F4511E] transition-colors flex items-center gap-1">Security <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" /></Link></li>
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">Press & Media</Link></li>
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">Institutional Sales</Link></li>
            </ul>
          </div>

          {/* Resources & Legal Column */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8FAFC]">Resources & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">API Documentation</Link></li>
              <li><Link href="/news" className="hover:text-[#F4511E] transition-colors">Market News</Link></li>
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-[#F4511E] transition-colors">Risk Disclosure</Link></li>
            </ul>
          </div>

        </div>

        {/* Apps & Language Bar */}
        <div className="pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-xs text-[#F8FAFC] hover:border-[#F4511E]/50 transition-all">
              <AppleIcon className="w-4 h-4 text-[#F4511E]" />
              <div className="text-left">
                <div className="text-[9px] text-[#94A3B8]">Download on the</div>
                <div className="font-semibold text-xs leading-none">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-xs text-[#F8FAFC] hover:border-[#F4511E]/50 transition-all">
              <PlayStoreIcon className="w-4 h-4 text-[#F4511E]" />
              <div className="text-left">
                <div className="text-[9px] text-[#94A3B8]">GET IT ON</div>
                <div className="font-semibold text-xs leading-none">Google Play</div>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-[#94A3B8] bg-[#0B0F14] px-3 py-1.5 rounded-lg border border-[#1E293B]">
              <Globe className="w-3.5 h-3.5 text-[#F4511E]" />
              <span>English (US) / USD</span>
            </div>
            <div className="flex items-center gap-2 text-[#F4511E] bg-[#F4511E]/10 px-2.5 py-1 rounded-lg font-mono text-[11px] border border-[#F4511E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4511E] animate-pulse"></span>
              All Systems Operational
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-[#1E293B]/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} StockInside Trading Inc. All rights reserved.</p>
          <p className="max-w-xl text-center md:text-right text-[11px] leading-relaxed">
            Trading digital assets involves significant risk and can result in the loss of capital. Information provided is for educational and quantitative simulation purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.74a1.56 1.56 0 1 0 0 3.12 1.56 1.56 0 0 0 0-3.12z"/>
    </svg>
  );
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.86-1.01 2.96 1.08.08 2.18-.55 2.84-1.36z"/>
    </svg>
  );
}

function PlayStoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 20.5v-17c0-.58.33-1.08.84-1.32l11.19 9.82-11.19 9.82c-.51-.24-.84-.74-.84-1.32zm13.45-7.14l3.19-2.8c.45-.39.45-1.03 0-1.42l-3.19-2.8-2.78 2.44 2.78 2.58zm-11.53 8.3l10.22-8.97 2.37 2.07-11.75 10.32c-.32.28-.84.28-1.16 0l-.32-.28c-.36-.32-.36-.84 0-1.14zm10.22-17.35l-10.22-8.97c-.36-.31-.36-.83 0-1.15l.32-.28c.32-.28.84-.28 1.16 0l11.75 10.33-2.37 2.07z"/>
    </svg>
  );
}
