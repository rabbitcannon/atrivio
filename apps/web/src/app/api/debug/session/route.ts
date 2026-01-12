import { NextResponse } from 'next/server';
import { getSession, createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get session using getSession helper
    const session = await getSession();

    // Also try getting user directly
    const { data: userData, error: userError } = await supabase.auth.getUser();

    return NextResponse.json({
      hasSession: !!session,
      sessionUserId: session?.user?.id,
      hasAccessToken: !!session?.access_token,
      hasUserFromGetUser: !!userData?.user,
      userFromGetUserId: userData?.user?.id,
      userError: userError?.message,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
