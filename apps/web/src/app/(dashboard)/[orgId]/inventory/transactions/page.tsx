import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { TransactionsList } from '@/components/features/inventory';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Inventory Transactions',
};

interface TransactionsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">View all inventory movements and adjustments.</p>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <TransactionsList orgId={orgId} />
      </FadeIn>
    </div>
  );
}
