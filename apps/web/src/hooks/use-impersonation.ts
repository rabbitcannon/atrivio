'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import { useImpersonationStore } from '@/stores/impersonation-store';
import { impersonateUser } from '@/lib/api/admin';

interface ImpersonationResult {
  success: boolean;
  error?: string;
}

// Helper to verify OTP and get session
async function verifyImpersonationToken(tokenHash: string) {
  const supabase = createClient();
  return supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' });
}

interface UseImpersonationResult {
  isImpersonating: boolean;
  impersonatedUser: { id: string; email: string; name: string } | null;
  expiresAt: string | null;
  startImpersonation: (userId: string) => Promise<ImpersonationResult>;
  endImpersonation: () => Promise<void>;
  isProcessing: boolean;
}

/**
 * Hook to manage user impersonation for super admins.
 * Handles starting/ending impersonation sessions and manages session state.
 */
export function useImpersonation(): UseImpersonationResult {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, session, setUser, setSession } = useAuthStore();
  const {
    isImpersonating,
    impersonatedUser,
    expiresAt,
    startImpersonation: storeStartImpersonation,
    endImpersonation: storeEndImpersonation,
    clearImpersonation,
  } = useImpersonationStore();

  // Check for expiration on mount and periodically
  useEffect(() => {
    if (!isImpersonating || !expiresAt) return;

    const checkExpiration = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);
      if (now >= expiry) {
        clearImpersonation();
        router.push('/login');
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, [isImpersonating, expiresAt, clearImpersonation, router]);

  const startImpersonation = useCallback(
    async (userId: string): Promise<ImpersonationResult> => {
      if (!session || !user) {
        return { success: false, error: 'No active session' };
      }

      setIsProcessing(true);

      try {
        const result = await impersonateUser(userId);

        if (result.error || !result.data?.token) {
          const errorMsg = result.error?.message || 'Failed to get impersonation token';
          return { success: false, error: errorMsg };
        }

        const { user_id, email, user_name, token_hash, expires_at } = result.data;

        // Store admin session before switching
        storeStartImpersonation(
          { id: user_id, email, name: user_name },
          session,
          user,
          expires_at
        );

        // Authenticate as impersonated user
        const { data: authData, error: authError } = await verifyImpersonationToken(token_hash);

        if (authError || !authData.session) {
          clearImpersonation();
          return { success: false, error: authError?.message || 'Authentication failed' };
        }

        setUser(authData.user);
        setSession(authData.session);
        router.push('/');

        return { success: true };
      } catch (err) {
        clearImpersonation();
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
        return { success: false, error: errorMsg };
      } finally {
        setIsProcessing(false);
      }
    },
    [session, user, router, storeStartImpersonation, clearImpersonation, setUser, setSession]
  );

  const endImpersonation = useCallback(async () => {
    setIsProcessing(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      const { adminSession, adminUser } = storeEndImpersonation();

      if (adminSession && adminUser) {
        const { error } = await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });

        if (error) {
          router.push('/login');
          return;
        }

        setUser(adminUser);
        setSession(adminSession);
      }

      router.push('/admin/users');
    } catch {
      clearImpersonation();
      router.push('/login');
    } finally {
      setIsProcessing(false);
    }
  }, [router, storeEndImpersonation, clearImpersonation, setUser, setSession]);

  return {
    isImpersonating,
    impersonatedUser,
    expiresAt,
    startImpersonation,
    endImpersonation,
    isProcessing,
  };
}
