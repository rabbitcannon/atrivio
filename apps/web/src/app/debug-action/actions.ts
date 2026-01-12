'use server';

import { getSession } from '@/lib/supabase/server';

export async function testSessionAction() {
  const session = await getSession();

  console.log('[testSessionAction] Session exists:', !!session);
  console.log('[testSessionAction] User ID:', session?.user?.id);
  console.log('[testSessionAction] Has access token:', !!session?.access_token);

  return {
    hasSession: !!session,
    userId: session?.user?.id || null,
    hasAccessToken: !!session?.access_token,
  };
}
