import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';

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

  // No organizations - show onboarding or create org prompt
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Welcome to Haunt Platform</h1>
        <p className="text-muted-foreground mb-6">
          You do not have any organizations yet. Create your first organization to get started.
        </p>
        <a
          href="/onboarding"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create Organization
        </a>
      </div>
    </div>
  );
}
