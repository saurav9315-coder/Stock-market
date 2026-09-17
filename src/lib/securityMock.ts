/**
 * Antigravity Quant - Enterprise Security Mock Database
 * 
 * Manages user security states, dynamic score calculations, withdrawal protections,
 * and anti-fraud alerts, linking with the profileMock persistence.
 */

import { 
  loadProfile, 
  loadDevices, 
  loadSettings
} from './profileMock';

export interface SecurityScoreCard {
  score: number;
  protectionStatus: 'Secured' | 'Action Required' | 'Vulnerable';
  lastLogin: string;
  activeSessionsCount: number;
  trustedDevicesCount: number;
  failedLoginsCount: number;
}

export interface SecurityEventLog {
  id: string;
  event: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed' | 'Locked' | 'Warning';
}

export interface FraudAlert {
  id: string;
  alertType: 'Suspicious Login' | 'Brute Force Attempts' | 'Unusual Location' | 'Device Signature Mismatch';
  severity: 'Low' | 'Medium' | 'High';
  description: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  resolved: boolean;
}

export interface SecurityCheckItem {
  id: string;
  name: string;
  status: 'secure' | 'warning' | 'critical';
  description: string;
  recommendation: string;
}

// Initial Security Events Logs Seeded
export const INITIAL_SECURITY_EVENTS: SecurityEventLog[] = [
  { id: 'SEC-LOG-01', event: 'Console Authorization Success', timestamp: '2026-07-16T15:45:00Z', ipAddress: '192.168.1.103', location: 'New York, USA', device: 'MacBook Pro', browser: 'Chrome 122.0', status: 'Success' },
  { id: 'SEC-LOG-02', event: 'Password Update Execution', timestamp: '2026-07-15T14:10:00Z', ipAddress: '192.168.1.103', location: 'New York, USA', device: 'MacBook Pro', browser: 'Chrome 122.0', status: 'Success' },
  { id: 'SEC-LOG-03', event: 'Failed Authentication Attempt', timestamp: '2026-07-10T09:38:00Z', ipAddress: '198.51.100.42', location: 'Dublin, Ireland', device: 'Dell Workstation', browser: 'Firefox 120.0', status: 'Failed' },
  { id: 'SEC-LOG-04', event: 'API Private Key Generated', timestamp: '2026-06-25T11:20:00Z', ipAddress: '192.168.1.103', location: 'New York, USA', device: 'MacBook Pro', browser: 'Chrome 122.0', status: 'Success' },
  { id: 'SEC-LOG-05', event: 'New Device session authorization', timestamp: '2026-06-20T10:15:00Z', ipAddress: '172.56.21.89', location: 'Lagos, Nigeria', device: 'iPhone 15 Pro', browser: 'Safari 17.2', status: 'Warning' }
];

// Initial Fraud Center Alerts
export const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'FRD-ALT-01',
    alertType: 'Unusual Location',
    severity: 'Medium',
    description: 'Account login request originated from unknown IP coordinates in Dublin, Ireland while active sessions remain in New York.',
    timestamp: '2026-07-10T09:38:00Z',
    ipAddress: '198.51.100.42',
    location: 'Dublin, Ireland',
    resolved: false
  },
  {
    id: 'FRD-ALT-02',
    alertType: 'Brute Force Attempts',
    severity: 'High',
    description: 'Multiple failed login entries (3+) detected within 60 seconds on standard credentials gateways.',
    timestamp: '2026-07-05T18:22:00Z',
    ipAddress: '45.12.90.111',
    location: 'Moscow, Russia',
    resolved: true
  }
];

export class SecurityDatabase {
  // Get active transaction PIN
  static getTransactionPin(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('security_tx_pin') || '';
  }

  static setTransactionPin(pin: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_tx_pin', pin);
    }
  }

  // Get active withdrawal PIN
  static getWithdrawalPin(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('security_wd_pin') || '';
  }

  static setWithdrawalPin(pin: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_wd_pin', pin);
    }
  }

  // Withdrawal configurations
  static getWithdrawalLimit(): number {
    if (typeof window === 'undefined') return 50000;
    const val = localStorage.getItem('security_wd_limit');
    return val ? Number(val) : 50000;
  }

  static setWithdrawalLimit(limit: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_wd_limit', limit.toString());
    }
  }

  static isWithdrawalFrozen(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('security_wd_frozen') === 'true';
  }

  static setWithdrawalFrozen(frozen: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_wd_frozen', frozen ? 'true' : 'false');
    }
  }

  static isWithdrawalDelayEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('security_wd_delay') === 'true';
  }

  static setWithdrawalDelayEnabled(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_wd_delay', enabled ? 'true' : 'false');
    }
  }

  // Get and set security event logs
  static getSecurityEvents(): SecurityEventLog[] {
    if (typeof window === 'undefined') return INITIAL_SECURITY_EVENTS;
    const saved = localStorage.getItem('security_center_events_list');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_SECURITY_EVENTS; }
    }
    localStorage.setItem('security_center_events_list', JSON.stringify(INITIAL_SECURITY_EVENTS));
    return INITIAL_SECURITY_EVENTS;
  }

  static setSecurityEvents(events: SecurityEventLog[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_center_events_list', JSON.stringify(events));
    }
  }

  // Get and set fraud center alerts
  static getFraudAlerts(): FraudAlert[] {
    if (typeof window === 'undefined') return INITIAL_FRAUD_ALERTS;
    const saved = localStorage.getItem('security_center_fraud_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_FRAUD_ALERTS; }
    }
    localStorage.setItem('security_center_fraud_alerts', JSON.stringify(INITIAL_FRAUD_ALERTS));
    return INITIAL_FRAUD_ALERTS;
  }

  static setFraudAlerts(alerts: FraudAlert[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_center_fraud_alerts', JSON.stringify(alerts));
    }
  }

  // Session Timeout limits (minutes)
  static getSessionTimeoutMinutes(): number {
    if (typeof window === 'undefined') return 15;
    const val = localStorage.getItem('security_session_timeout');
    return val ? Number(val) : 15;
  }

  static setSessionTimeoutMinutes(mins: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_session_timeout', mins.toString());
    }
  }

  // Log Security Event
  static logSecurityEvent(event: string, status: SecurityEventLog['status'] = 'Success') {
    const events = this.getSecurityEvents();
    const newEntry: SecurityEventLog = {
      id: `SEC-LOG-${Math.floor(10 + Math.random() * 90)}`,
      event,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.103',
      location: 'New York, USA',
      device: 'MacBook Pro',
      browser: 'Chrome 122.0',
      status
    };
    this.setSecurityEvents([newEntry, ...events]);
  }

  // Dynamic score calculator
  static calculateSecurityScore(): { score: number; checklist: SecurityCheckItem[] } {
    const profile = loadProfile();
    const settings = loadSettings();
    const devices = loadDevices();

    let score = 30; // base value
    const checklist: SecurityCheckItem[] = [];

    // 1. Password check (Seeded password assumed secure, but let's audit)
    checklist.push({
      id: 'chk-password',
      name: 'Credentials Pass strength',
      status: 'secure',
      description: 'Account login utilizes a strong quantitative password sequence.',
      recommendation: 'Periodically rotate keys to mitigate dictionary attacks.'
    });
    score += 15;

    // 2. 2FA Check
    const has2fa = settings?.twoFactorEnabled || false;
    checklist.push({
      id: 'chk-2fa',
      name: 'Two-Factor Authentication',
      status: has2fa ? 'secure' : 'critical',
      description: has2fa 
        ? 'OTP (Google/Microsoft authenticator tokens) is configured on transaction terminals.' 
        : 'Missing secondary factor authentication. Account vulnerable to brute entries.',
      recommendation: 'Deploy Google or Microsoft Authenticator OTP modules.'
    });
    if (has2fa) score += 30;

    // 3. Biometrics / Passkeys
    const hasPasskey = settings?.biometricEnabled || false;
    checklist.push({
      id: 'chk-passkey',
      name: 'Biometric / Passkeys Encryption',
      status: hasPasskey ? 'secure' : 'warning',
      description: hasPasskey 
        ? 'Passkeys hardware authentication is active.' 
        : 'Webauthn passkeys are offline.',
      recommendation: 'Enable fingerprint or biometric hardware keys for instant login clearances.'
    });
    if (hasPasskey) score += 10;

    // 4. Mobile phone verification
    const hasPhone = profile?.phone ? true : false;
    checklist.push({
      id: 'chk-phone',
      name: 'Phone contact validations',
      status: hasPhone ? 'secure' : 'critical',
      description: hasPhone ? `Primary contact registered: ${profile.phone}` : 'No phone details loaded.',
      recommendation: 'Complete phone verification triggers to activate SMS channels.'
    });
    if (hasPhone) score += 10;

    // 5. Inactive devices audit
    const activeDevices = devices.length;
    checklist.push({
      id: 'chk-devices',
      name: 'Device Terminals Audit',
      status: activeDevices <= 2 ? 'secure' : 'warning',
      description: `Active device authorization tokens: ${activeDevices}`,
      recommendation: activeDevices > 2 ? 'Revoke obsolete authorization tokens in Active Sessions.' : 'Device sessions count optimal.'
    });
    if (activeDevices <= 2) score += 5;

    // Cap score at 100
    score = Math.min(score, 100);

    return { score, checklist };
  }
}
