import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveOrgId } from '@/lib/api';
import { CheckoutsList } from '@/components/features/inventory';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${orgIdentifier}/inventory`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Checkouts</h1>
          <p className="text-muted-foreground">
            Track items checked out to staff members.
          </p>
        </div>
      </div>

      <CheckoutsList orgId={orgId} />
    </div>
  );
}
