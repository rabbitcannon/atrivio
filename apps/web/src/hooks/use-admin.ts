'use client';

import { useEffect, useState } from 'react';
import { useUser } from './use-user';
import { createClient } from '@/lib/supabase/client';

interface AdminData {
  is_super_admin: boolean;
}

/**
 * Hook to check if the current user is a super admin.
 * Returns loading state and admin status.
 */
export function useAdmin() {
  const { user, isLoading: userLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    async function checkAdminStatus() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', user?.id ?? '')
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin((data as AdminData)?.is_super_admin ?? false);
      }

      setIsLoading(false);
    }

    checkAdminStatus();
  }, [user, userLoading]);

  return { isAdmin, isLoading: userLoading || isLoading, user };
}
