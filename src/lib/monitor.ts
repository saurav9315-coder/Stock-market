/**
 * Antigravity Quant - Telemetry, Logging & Monitoring Infrastructure
 * 
 * Provides typesafe tracking of Core Web Vitals, API response latency,
 * security alerts, authentication events, and integration hooks for
 * Sentry, Google Analytics, and Microsoft Clarity.
 */

export interface MetricPayload {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
}

export interface ErrorLogPayload {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userId?: string;
}

export interface SecurityEventPayload {
  action: 'LOGIN_ATTEMPT' | 'MFA_TOGGLE' | 'CREDENTIALS_RESET' | 'DEVICE_AUTHORIZED' | 'ADMIN_BYPASS';
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  userId?: string;
  ip?: string;
}

class TelemetryMonitor {
  private debugMode: boolean = process.env.NODE_ENV !== 'production';

  // 1. Core Web Vitals Telemetry
  public logCoreWebVitals(metric: MetricPayload) {
    const output = `[WEB-VITALS] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating || 'N/A'})`;
    if (this.debugMode) {
      console.log(output);
    }
    // Google Analytics Integration
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Core Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }

  // 2. API Latency & Metrics Logger
  public logApiLatency(endpoint: string, durationMs: number, statusCode: number) {
    const output = `[API-LATENCY] ${endpoint} -> Status ${statusCode} in ${durationMs}ms`;
    if (this.debugMode) {
      console.log(output);
    }
  }

  // 3. Security & Auth Event Logs
  public logSecurity(payload: SecurityEventPayload) {
    const date = new Date().toISOString();
    const output = `[SECURITY-AUDIT] [${date}] [${payload.action}] Status: ${payload.status} | User: ${payload.userId || 'Guest'}`;
    if (this.debugMode) {
      console.warn(output);
    }
  }

  // 4. Global Error Boundary logger (Sentry proxy)
  public logError(error: ErrorLogPayload) {
    const date = new Date().toISOString();
    const output = `[ERROR-BOUNDARY] [${date}] Msg: ${error.message} | URL: ${error.url || 'N/A'}`;
    console.error(output);
    if (error.stack) {
      console.error(error.stack);
    }

    // Dynamic Sentry mock payload dispatcher
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message));
    }
  }

  // 5. Google Analytics Page Tracker
  public trackPage(path: string) {
    if (this.debugMode) {
      console.log(`[PAGE-VIEW] Path: ${path}`);
    }
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-ANALYTICS-ID', {
        page_path: path,
      });
    }
  }
}

export const monitor = new TelemetryMonitor();
export default monitor;
