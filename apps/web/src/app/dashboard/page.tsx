import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';

export default async function DashboardRedirectPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Check if user is super admin first
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  if (profile?.is_super_admin) {
    redirect('/admin');
  }

  // Get user's first organization
  const { data: memberships } = await supabase
    .from('org_memberships')
    .select('organizations(slug)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .single();

  if (memberships?.organizations) {
    // Redirect to the first organization
    const org = memberships.organizations as unknown as { slug: string };
    redirect(`/${org.slug}`);
  }

  // No organizations - redirect to create org flow
  redirect('/organizations/new');
}
