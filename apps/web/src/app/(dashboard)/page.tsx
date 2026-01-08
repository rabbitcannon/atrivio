import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';

// Force dynamic rendering - this page requires authentication and redirects
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const supabase = await createClient();

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
    redirect(`/${org.slug}` as never);
  }

  // No organizations - redirect to create one
  redirect('/organizations/new');
}
