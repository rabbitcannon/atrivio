import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { resolveOrgId } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'My Time Tracking',
};

interface MyTimePageProps {
  params: Promise<{ orgId: string }>;
}

export default async function MyTimePage({ params }: MyTimePageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's membership ID for this org
  const { data: membership } = await supabase
    .from('org_memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .single();

  if (!membership) {
    notFound();
  }

  // Redirect to the user's staff time page
  redirect(`/${orgIdentifier}/staff/${membership.id}/time`);
}
