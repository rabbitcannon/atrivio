import { getSession } from '@/lib/supabase/server';
import { TestSessionClient } from './client';

async function debugAction(): Promise<void> {
  'use server';

  const session = await getSession();

  console.log('[debugAction] Session exists:', !!session);
  console.log('[debugAction] User ID:', session?.user?.id);
  console.log('[debugAction] Has access token:', !!session?.access_token);
  console.log('[debugAction] Result:', JSON.stringify({
    hasSession: !!session,
    userId: session?.user?.id || null,
    hasAccessToken: !!session?.access_token,
  }));
}

export default function DebugActionPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Server Action</h1>

      <div style={{ marginBottom: '40px' }}>
        <h2>Form-based Server Action Call</h2>
        <form action={debugAction}>
          <button type="submit" style={{ padding: '10px 20px' }}>
            Test Session via Form
          </button>
        </form>
      </div>

      <hr />

      <div style={{ marginTop: '40px' }}>
        <TestSessionClient />
      </div>
    </div>
  );
}
