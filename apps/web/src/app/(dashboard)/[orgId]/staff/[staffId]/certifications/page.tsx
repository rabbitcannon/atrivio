import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { CertificationsManager } from '@/components/features/staff/certifications-manager';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Certifications',
};

interface CertificationsPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function CertificationsPage({ params }: CertificationsPageProps) {
  const { orgId: orgIdentifier, staffId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgIdentifier}/staff/${staffId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to staff profile</span>
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Certifications</h1>
          <p className="text-muted-foreground">Manage certifications for this staff member.</p>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <CertificationsManager orgId={orgId} staffId={staffId} />
      </FadeIn>
    </div>
  );
}
