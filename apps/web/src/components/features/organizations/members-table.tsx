'use client';

import { AlertCircle, MoreHorizontal, Shield, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrg } from '@/hooks/use-org';
import {
  getOrganizationMembers,
  type OrganizationMember,
  type OrgRole,
  removeMember,
  updateMemberRole,
} from '@/lib/api/client';

interface MembersTableProps {
  orgId: string;
}

const roleBadgeVariants: Record<OrgRole, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'default',
  manager: 'secondary',
  hr: 'secondary',
  box_office: 'outline',
  finance: 'outline',
  actor: 'outline',
  scanner: 'outline',
};

// Roles that can be assigned (owner cannot be assigned via UI)
const assignableRoles: OrgRole[] = [
  'admin',
  'manager',
  'hr',
  'box_office',
  'finance',
  'actor',
  'scanner',
];

function MembersTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function MembersTable({ orgId }: MembersTableProps) {
  const router = useRouter();
  const { currentOrg } = useOrg();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only owners and admins can manage member roles
  const canManageMembers = currentOrg?.role === 'owner' || currentOrg?.role === 'admin';

  // Role change dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);
  const [newRole, setNewRole] = useState<OrgRole | ''>('');
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);
  const [roleChangeError, setRoleChangeError] = useState<string | null>(null);

  // Remove member dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  async function fetchMembers() {
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await getOrganizationMembers(orgId);

    if (apiError) {
      setError(apiError.message || 'Failed to load members');
    } else if (data) {
      setMembers(data.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  function openRoleDialog(member: OrganizationMember) {
    setSelectedMember(member);
    setNewRole(member.role);
    setRoleChangeError(null);
    setRoleDialogOpen(true);
  }

  async function handleRoleChange() {
    if (!selectedMember || !newRole || newRole === selectedMember.role) {
      return;
    }

    setRoleChangeLoading(true);
    setRoleChangeError(null);

    const result = await updateMemberRole(orgId, selectedMember.id, newRole);

    if (result.error) {
      setRoleChangeError(result.error.message || 'Failed to update role');
      setRoleChangeLoading(false);
      return;
    }

    // Update local state
    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id ? { ...m, role: newRole } : m))
    );

    setRoleChangeLoading(false);
    setRoleDialogOpen(false);
    setSelectedMember(null);
    setNewRole('');
    router.refresh();
  }

  function openRemoveDialog(member: OrganizationMember) {
    setMemberToRemove(member);
    setRemoveError(null);
    setRemoveDialogOpen(true);
  }

  async function handleRemoveMember() {
    if (!memberToRemove) {
      return;
    }

    setRemoveLoading(true);
    setRemoveError(null);

    const result = await removeMember(orgId, memberToRemove.id);

    if (result.error) {
      setRemoveError(result.error.message || 'Failed to remove member');
      setRemoveLoading(false);
      return;
    }

    // Update local state
    setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));

    setRemoveLoading(false);
    setRemoveDialogOpen(false);
    setMemberToRemove(null);
    router.refresh();
  }

  if (loading) {
    return <MembersTableSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading members</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No members yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Members will appear here once they join your organization.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const fullName =
                [member.user.first_name, member.user.last_name].filter(Boolean).join(' ') ||
                member.user.email;
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{fullName}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariants[member.role]}>
                      {member.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {!member.is_owner && canManageMembers && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => openRemoveDialog(member)}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for{' '}
              <span className="font-medium">
                {selectedMember?.user.first_name || selectedMember?.user.email}
              </span>
              . This will change their permissions in the organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {roleChangeError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {roleChangeError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">New Role</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as OrgRole)}
                disabled={roleChangeLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {assignableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={roleChangeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={roleChangeLoading || !newRole || newRole === selectedMember?.role}
            >
              {roleChangeLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {memberToRemove?.user.first_name || memberToRemove?.user.email}
              </span>{' '}
              from this organization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {removeError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {removeError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
              disabled={removeLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={removeLoading}>
              {removeLoading ? 'Removing...' : 'Remove Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
