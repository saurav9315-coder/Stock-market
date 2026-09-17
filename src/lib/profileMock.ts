export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  nationality: string;
  occupation: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  username: string;
  userId: string;
  email: string;
  phone: string;
  joinedDate: string;
  accountType: 'Retail Trader' | 'Pro Investor' | 'Institutional Account';
  currency: string;
  kycStatus: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  profilePhoto: string;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  loginTime: string;
  ipAddress: string;
  current: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  secret: string;
  permissions: 'Read' | 'Trade' | 'Full Access';
  createdAt: string;
}

export interface Webhook {
  id: string;
  url: string;
  secret: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  event: string;
  timestamp: string;
  device: string;
  status: 'Success' | 'Failed' | 'Warning' | 'Info';
}

export interface SupportMessage {
  sender: 'User' | 'Support';
  text: string;
  time: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'General' | 'API Access' | 'KYC Verification' | 'Trading Issues' | 'Deposits/Withdrawals';
  status: 'Open' | 'Resolved';
  createdAt: string;
  description: string;
  messages: SupportMessage[];
}

export interface UserSettings {
  emailNotif: boolean;
  pushNotif: boolean;
  smsNotif: boolean;
  whatsappNotif: boolean;
  telegramNotif: boolean;
  aiAlerts: boolean;
  marketAlerts: boolean;
  portfolioAlerts: boolean;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  loginAlertsEnabled: boolean;
  privacyLeaderboard: boolean;
  privacyTelemetry: boolean;
}

export const INITIAL_PROFILE: UserProfile = {
  firstName: "Alex",
  lastName: "Mercer",
  dob: "1994-06-15",
  gender: "Male",
  nationality: "American",
  occupation: "Quantitative Analyst",
  address: "124 Quant Avenue, Block 4B",
  city: "New York",
  state: "NY",
  country: "United States",
  postalCode: "10001",
  username: "alexmercer_quant",
  userId: "USR-8820491",
  email: "alex.mercer@antigravity-quant.com",
  phone: "+1 (555) 234-8829",
  joinedDate: "2025-03-10",
  accountType: "Pro Investor",
  currency: "USD ($)",
  kycStatus: "Approved",
  profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250"
};

export const INITIAL_DEVICES: DeviceSession[] = [
  {
    id: "dev-1",
    deviceName: "Apple MacBook Pro 16",
    browser: "Chrome 122.0.0",
    os: "macOS Sonoma 14.2",
    loginTime: "2026-07-16T08:32:00Z",
    ipAddress: "192.168.1.103",
    current: true
  },
  {
    id: "dev-2",
    deviceName: "iPhone 15 Pro Max",
    browser: "Safari Mobile 17.2",
    os: "iOS 17.2.1",
    loginTime: "2026-07-15T18:15:00Z",
    ipAddress: "172.56.21.89",
    current: false
  },
  {
    id: "dev-3",
    deviceName: "Dell XPS 15 Workstation",
    browser: "Firefox Developer Edition",
    os: "Windows 11 Pro",
    loginTime: "2026-07-10T09:40:00Z",
    ipAddress: "198.51.100.42",
    current: false
  }
];

export const INITIAL_API_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Stochastic_Execution_API",
    secret: "ag_live_key_••••••••••••••••••••••••3a9d",
    permissions: "Trade",
    createdAt: "2026-06-25T11:20:00Z"
  },
  {
    id: "key-2",
    name: "Model_Overlay_ReadOnly",
    secret: "ag_live_key_••••••••••••••••••••••••9e2c",
    permissions: "Read",
    createdAt: "2026-07-02T15:45:00Z"
  }
];

export const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: "hook-1",
    url: "https://api.myquantbot.com/webhook/alerts",
    secret: "whsec_••••••••••••••••91a8",
    status: "Active",
    createdAt: "2026-07-05T14:10:00Z"
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    event: "Console Terminal Login Success",
    timestamp: "2026-07-16T08:32:00Z",
    device: "MacBook Pro (Chrome 122.0.0)",
    status: "Success"
  },
  {
    id: "log-2",
    event: "API Key Revoked (indicator_model)",
    timestamp: "2026-07-15T14:22:00Z",
    device: "MacBook Pro (Chrome 122.0.0)",
    status: "Warning"
  },
  {
    id: "log-3",
    event: "MFA 2FA Verification Enabled",
    timestamp: "2026-07-15T10:15:00Z",
    device: "MacBook Pro (Chrome 122.0.0)",
    status: "Info"
  },
  {
    id: "log-4",
    event: "Login Attempt Failed - Incorrect Password",
    timestamp: "2026-07-10T09:38:00Z",
    device: "Dell XPS 15 (Firefox)",
    status: "Failed"
  },
  {
    id: "log-5",
    event: "Withdrawal Address Logged: BoA (******8829)",
    timestamp: "2026-07-06T11:55:00Z",
    device: "iPhone 15 Pro Max (Safari)",
    status: "Info"
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TCK-882910",
    subject: "Latency issues on Stochastic websocket socket channel feed",
    category: "Trading Issues",
    status: "Open",
    createdAt: "2026-07-14T11:00:00Z",
    description: "I am experiencing delays of up to 450ms on real-time price updates for high-volatility tick feeds.",
    messages: [
      {
        sender: "User",
        text: "I am experiencing delays of up to 450ms on real-time price updates for high-volatility tick feeds.",
        time: "2026-07-14T11:00:00Z"
      },
      {
        sender: "Support",
        text: "Hi Alex, thank you for writing. Our engineering desk is currently scaling up our sockets allocation nodes in New York. We will resolve this within 24 hours.",
        time: "2026-07-14T12:30:00Z"
      },
      {
        sender: "User",
        text: "Perfect, please keep me updated once node redistribution is complete.",
        time: "2026-07-14T14:00:00Z"
      }
    ]
  },
  {
    id: "TCK-881903",
    subject: "API Access Trade Permissions clearance check",
    category: "API Access",
    status: "Resolved",
    createdAt: "2026-06-20T09:15:00Z",
    description: "Requesting trade permission credentials for institutional compliance audits.",
    messages: [
      {
        sender: "User",
        text: "Requesting trade permission credentials for institutional compliance audits.",
        time: "2026-06-20T09:15:00Z"
      },
      {
        sender: "Support",
        text: "Your API profile has been approved for full execution capabilities. The token secret key has been refreshed.",
        time: "2026-06-20T14:45:00Z"
      }
    ]
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  emailNotif: true,
  pushNotif: true,
  smsNotif: false,
  whatsappNotif: false,
  telegramNotif: true,
  aiAlerts: true,
  marketAlerts: true,
  portfolioAlerts: true,
  language: "English (US)",
  currency: "USD ($)",
  timezone: "UTC -05:00 (New York)",
  dateFormat: "YYYY-MM-DD",
  twoFactorEnabled: true,
  biometricEnabled: false,
  loginAlertsEnabled: true,
  privacyLeaderboard: false,
  privacyTelemetry: true
};

// LocalStorage helpers
export const loadProfile = (): UserProfile => {
  if (typeof window === 'undefined') return INITIAL_PROFILE;
  const saved = localStorage.getItem('user_profile_data');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  // Initialize with wallet KYC status sync
  const walletKyc = localStorage.getItem('wallet_kyc_status') === 'true';
  const initial = { ...INITIAL_PROFILE, kycStatus: (walletKyc ? 'Approved' : 'Approved') as any };
  localStorage.setItem('user_profile_data', JSON.stringify(initial));
  return initial;
};

export const saveProfile = (profile: UserProfile) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_profile_data', JSON.stringify(profile));
  // Sync back to wallet's kyc status
  localStorage.setItem('wallet_kyc_status', profile.kycStatus === 'Approved' ? 'true' : 'false');
};

export const loadDevices = (): DeviceSession[] => {
  if (typeof window === 'undefined') return INITIAL_DEVICES;
  const saved = localStorage.getItem('profile_devices_list');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('profile_devices_list', JSON.stringify(INITIAL_DEVICES));
  return INITIAL_DEVICES;
};

export const saveDevices = (devices: DeviceSession[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('profile_devices_list', JSON.stringify(devices));
};

export const loadApiKeys = (): ApiKey[] => {
  if (typeof window === 'undefined') return INITIAL_API_KEYS;
  const saved = localStorage.getItem('profile_api_keys');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('profile_api_keys', JSON.stringify(INITIAL_API_KEYS));
  return INITIAL_API_KEYS;
};

export const saveApiKeys = (keys: ApiKey[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('profile_api_keys', JSON.stringify(keys));
};

export const loadWebhooks = (): Webhook[] => {
  if (typeof window === 'undefined') return INITIAL_WEBHOOKS;
  const saved = localStorage.getItem('profile_webhooks');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('profile_webhooks', JSON.stringify(INITIAL_WEBHOOKS));
  return INITIAL_WEBHOOKS;
};

export const saveWebhooks = (hooks: Webhook[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('profile_webhooks', JSON.stringify(hooks));
};

export const loadActivityLogs = (): ActivityLog[] => {
  if (typeof window === 'undefined') return INITIAL_ACTIVITY_LOGS;
  const saved = localStorage.getItem('profile_activity_logs');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('profile_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
  return INITIAL_ACTIVITY_LOGS;
};

export const saveActivityLogs = (logs: ActivityLog[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('profile_activity_logs', JSON.stringify(logs));
};

export const loadTickets = (): SupportTicket[] => {
  if (typeof window === 'undefined') return INITIAL_TICKETS;
  const saved = localStorage.getItem('profile_support_tickets');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('profile_support_tickets', JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

export const saveTickets = (tickets: SupportTicket[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('profile_support_tickets', JSON.stringify(tickets));
};

export const loadSettings = (): UserSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem('user_settings_configuration');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  localStorage.setItem('user_settings_configuration', JSON.stringify(DEFAULT_SETTINGS));
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: UserSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user_settings_configuration', JSON.stringify(settings));
};
