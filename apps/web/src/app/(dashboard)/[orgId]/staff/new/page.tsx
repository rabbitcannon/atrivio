import type { Metadata } from 'next';
import { StaffForm } from '@/components/features/staff/staff-form';

export const metadata: Metadata = {
  title: 'Add Staff',
};

interface NewStaffPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function NewStaffPage({ params }: NewStaffPageProps) {
  const { orgId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Staff Member</h1>
        <p className="text-muted-foreground">Add a new staff member to your organization.</p>
      </div>

      <StaffForm orgId={orgId} />
    </div>
  );
}
