import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { CheckoutsList } from '@/components/features/inventory';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { requireRole, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Inventory Checkouts',
};

interface CheckoutsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function CheckoutsPage({ params }: CheckoutsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Owner, admin, manager, and actor can access inventory checkouts
  await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'actor']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedPageHeader className="flex items-center gap-4">
        <Link href={`/${orgIdentifier}/inventory`}>
          <Button variant="ghost" size="icon" aria-label="Back to inventory">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Checkouts</h1>
          <p className="text-muted-foreground">Track items checked out to staff members.</p>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <CheckoutsList orgId={orgId} />
      </FadeIn>
    </div>
  );
}
