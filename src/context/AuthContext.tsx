'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { AuthService } from '@/lib/services';
import { setAccessToken, setRefreshToken } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  is2faRequired: boolean;
  isAccountLocked: boolean;
  isSessionExpired: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  verify2fa: (code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  logout: () => void;
  triggerSessionExpired: () => void;
  triggerAccountLocked: () => void;
  unlockAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [is2faRequired, setIs2faRequired] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Initialize session
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined') {
          const persistedUser = localStorage.getItem('aq_user');
          const token = localStorage.getItem('aq_access_token');
          if (persistedUser && token) {
            setUser(JSON.parse(persistedUser));
          }
        }
      } catch (err) {
        console.error('Failed to load session', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;

    const publicRoutes = [
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/verify-otp',
      '/verify-2fa',
      '/session-expired',
      '/account-locked',
      '/trading',
      '/markets',
      '/screener',
      '/news',
      '/portfolio',
      '/ai-analysis',
      '/watchlist',
      '/security'
    ];

    const isPublic = publicRoutes.includes(pathname);
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

    if (isAccountLocked && pathname !== '/account-locked') {
      router.push('/account-locked');
    } else if (isSessionExpired && pathname !== '/session-expired') {
      router.push('/session-expired');
    } else if (isAdminRoute) {
      if (!user) {
        toast.error('Authentication Required', {
          description: 'Please authenticate with administrative credentials.'
        });
        router.push('/login');
      } else if (user.role !== 'ADMIN' && user.role !== 'ROLE_ADMIN') {
        toast.error('Access Denied: 403 Forbidden', {
          description: 'Administrative privileges required to access the Admin Panel.'
        });
        router.push('/dashboard');
      }
    } else if (!user && !isPublic) {
      toast.error('Session Required', {
        description: 'Please authenticate to access the trading terminal.'
      });
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register')) {
      if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, isAccountLocked, isSessionExpired, router]);

  // Login
  const login = async (email: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    try {
      const response = await AuthService.login({ email, password, rememberMe });
      
      if (response.requires2fa) {
        setIs2faRequired(true);
        router.push('/verify-2fa');
        return;
      }

      const { accessToken, refreshToken, user: loggedUser } = response;
      
      setUser(loggedUser);
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('aq_user', JSON.stringify(loggedUser));
      }

      toast.success('Access Granted', {
        description: `Welcome back, ${loggedUser.name}. Ticker streams initialized.`
      });
      router.push('/dashboard');
    } catch (err: any) {
      if (err.status === 403 || err.message?.includes('locked')) {
        setIsAccountLocked(true);
        router.push('/account-locked');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      await AuthService.register({ name, email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('aq_pending_email', email);
        localStorage.setItem('aq_pending_name', name);
      }
      toast.success('Registration Initiated', {
        description: 'We have dispatched a verification code to your email.'
      });
      router.push('/verify-email');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify Email
  const verifyEmailCode = async (code: string) => {
    setLoading(true);
    try {
      const response = await AuthService.verifyEmail(code);
      const { accessToken, refreshToken, user: loggedUser } = response;

      setUser(loggedUser);
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('aq_user', JSON.stringify(loggedUser));
        localStorage.removeItem('aq_pending_email');
        localStorage.removeItem('aq_pending_name');
      }

      toast.success('Account Verified', {
        description: 'Email confirmed. Dashboard channels initialized.'
      });
      router.push('/dashboard');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Generic / Reset)
  const verifyOtp = async (code: string) => {
    setLoading(true);
    try {
      await AuthService.verifyOtp({ code });
      toast.success('Verification Succeeded');
      router.push('/reset-password');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA
  const verify2fa = async (code: string) => {
    setLoading(true);
    try {
      const response = await AuthService.verify2fa(code);
      const { accessToken, refreshToken, user: loggedUser } = response;

      setUser(loggedUser);
      setAccessToken(accessToken);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('aq_user', JSON.stringify(loggedUser));
      }
      setIs2faRequired(false);

      toast.success('2FA Verified', {
        description: 'MFA signature verified. Terminal channels open.'
      });
      router.push('/dashboard');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await AuthService.forgotPassword({ email });
      if (typeof window !== 'undefined') {
        localStorage.setItem('aq_reset_email', email);
      }
      toast.success('Passcode Reset Sent', {
        description: 'Check your email inbox for resetting coordinates.'
      });
      router.push('/verify-otp');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (password: string) => {
    setLoading(true);
    try {
      await AuthService.resetPassword({ password, confirmPassword: password });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aq_reset_email');
      }
      toast.success('Password Modified', {
        description: 'Authentication secrets updated. Please authenticate with new password.'
      });
      router.push('/login');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      setUser(null);
      setIs2faRequired(false);
      setIsSessionExpired(false);
      setAccessToken(null);
      setRefreshToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aq_user');
        localStorage.removeItem('aq_refresh_token');
      }
      toast.info('Session Terminated', {
        description: 'Security keys flushed from local runtime storage.'
      });
      router.push('/login');
    }
  };

  // Force Session Expired
  const triggerSessionExpired = () => {
    setIsSessionExpired(true);
    setUser(null);
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aq_user');
      localStorage.removeItem('aq_refresh_token');
    }
    router.push('/session-expired');
  };

  // Force Account Locked
  const triggerAccountLocked = () => {
    setIsAccountLocked(true);
    setUser(null);
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aq_user');
      localStorage.removeItem('aq_refresh_token');
    }
    router.push('/account-locked');
  };

  const unlockAccount = () => {
    setIsAccountLocked(false);
    toast.success('Account Restored', {
      description: 'Security lock lifted. Please retry authentication.'
    });
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        is2faRequired,
        isAccountLocked,
        isSessionExpired,
        login,
        register,
        verifyEmailCode,
        verifyOtp,
        verify2fa,
        forgotPassword,
        resetPassword,
        logout,
        triggerSessionExpired,
        triggerAccountLocked,
        unlockAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be utilized within an AuthProvider');
  }
  return context;
}
