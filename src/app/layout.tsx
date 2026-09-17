import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import MainLayout from "@/components/layout/MainLayout";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#040406",
};

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-stylish",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StockInside Trading | Enterprise Stock Analytics & Research Platform",
  description: "Real-time stock analysis, portfolio allocation modelling, and dynamic indicators screener for institutional investors.",
  metadataBase: new URL('https://quant-platform.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "StockInside Trading | Enterprise Stock Analytics & Research Platform",
    description: "Real-time stock analysis, portfolio allocation modelling, and dynamic indicators screener for institutional investors.",
    url: 'https://quant-platform.com',
    siteName: 'StockInside Trading',
    images: [
      {
        url: '/favicon.ico',
        width: 64,
        height: 64,
        alt: 'StockInside Trading Icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'StockInside Trading Platform',
    description: 'Enterprise stock analysis, portfolio modelling, and high-frequency indicator signals.',
    images: ['/favicon.ico'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  'name': 'Antigravity Quant Analytics Terminal',
  'description': 'Real-time stock analysis, portfolio allocation modelling, and dynamic indicators screener for institutional investors.',
  'brand': {
    '@type': 'Brand',
    'name': 'Antigravity Quant'
  },
  'offers': {
    '@type': 'Offer',
    'price': '0.00',
    'priceCurrency': 'USD'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} ${jakarta.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen w-full max-w-full bg-background text-foreground antialiased">
        <Providers>
          <MainLayout>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </MainLayout>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          suppressHydrationWarning
        />
      </body>
    </html>
  );
}
