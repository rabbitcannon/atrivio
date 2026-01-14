import { redirect } from 'next/navigation';
import { DemoTourWrapper } from '@/components/features/demo-tour';
import { AnnouncementBanner } from '@/components/features/platform/announcement-banner';
import { DashboardHeader } from '@/components/layouts/dashboard-header';
import { DashboardSidebar } from '@/components/layouts/dashboard-sidebar';
import { PageTransition } from '@/components/ui/page-transition';
import { getUser } from '@/lib/supabase/server';

// Force dynamic rendering - dashboard requires authentication
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DemoTourWrapper>
      <div className="flex h-screen flex-col">
        <DashboardHeader />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto bg-background p-6">
            <AnnouncementBanner />
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </DemoTourWrapper>
  );
}
