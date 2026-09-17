import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quant-platform.com';

  const staticRoutes = [
    '',
    '/dashboard',
    '/portfolio',
    '/watchlist',
    '/wallet',
    '/admin',
    '/news',
    '/ai-analysis',
    '/settings',
    '/security',
    '/alerts',
    '/screener',
    '/markets',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const activeSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN'];
  const stockRoutes = activeSymbols.map((sym) => ({
    url: `${baseUrl}/stock/${sym}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...stockRoutes];
}
