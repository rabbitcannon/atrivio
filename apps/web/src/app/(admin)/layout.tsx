import { redirect } from 'next/navigation';
import { getUser, createClient } from '@/lib/supabase/server';
import { AdminHeader } from '@/components/layouts/admin-header';
import { AdminSidebar } from '@/components/layouts/admin-sidebar';
import { PageTransition } from '@/components/ui/page-transition';

interface AdminData {
  is_super_admin: boolean;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is super admin
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  if (error || !(data as AdminData)?.is_super_admin) {
    // Not a super admin, redirect to regular dashboard
    redirect('/');
  }

  return (
    <div className="flex h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-background p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
