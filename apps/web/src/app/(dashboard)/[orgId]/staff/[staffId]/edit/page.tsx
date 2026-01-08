import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StaffEditForm } from '@/components/features/staff/staff-edit-form';
import { getStaffMember, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Edit Staff',
};

interface EditStaffPageProps {
  params: Promise<{ orgId: string; staffId: string }>;
}

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { orgId: orgIdentifier, staffId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Fetch staff data from API
  const { data: staff, error } = await getStaffMember(orgId, staffId);

  if (error || !staff) {
    notFound();
  }

  const staffName = staff.user
    ? `${staff.user.first_name || ''} ${staff.user.last_name || ''}`.trim() || 'Unknown'
    : 'Unknown';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Staff Profile</h1>
        <p className="text-muted-foreground">Update profile for {staffName}.</p>
      </div>

      <StaffEditForm orgId={orgId} staff={staff} />
    </div>
  );
}
