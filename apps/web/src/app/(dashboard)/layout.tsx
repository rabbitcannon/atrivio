import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { PageTransition } from '@/components/ui/page-transition';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-auto bg-background p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
