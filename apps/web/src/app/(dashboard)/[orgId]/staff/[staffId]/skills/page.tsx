import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillsManager } from '@/components/features/staff/skills-manager';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Skills',
};

interface SkillsPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { orgId: orgIdentifier, staffId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgIdentifier}/staff/${staffId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to staff profile</span>
          </a>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Skills</h1>
          <p className="text-muted-foreground">Manage skills for this staff member.</p>
        </div>
      </div>

      <SkillsManager orgId={orgId} staffId={staffId} />
    </div>
  );
}
