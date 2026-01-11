'use client';

import { AlertCircle, Award, Clock, MoreHorizontal, User, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStaff, type StaffListItem } from '@/lib/api/client';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

interface StaffTableProps {
  orgId: string;
}

function StaffTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Skills</TableHead>
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
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-32" />
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

export function StaffTable({ orgId }: StaffTableProps) {
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStaff() {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getStaff(orgId);

      if (apiError) {
        setError(apiError.message || 'Failed to load staff members');
      } else if (data) {
        setStaff(data.data);
      }

      setLoading(false);
    }

    fetchStaff();
  }, [orgId]);

  if (loading) {
    return <StaffTableSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading staff</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (staff.length === 0) {
    return <AnimatedEmptyState />;
  }

  return <AnimatedStaffTable staff={staff} orgId={orgId} />;
}

/**
 * Animated empty state for staff table
 */
function AnimatedEmptyState() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No staff members yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff members will appear here once they are added to your organization.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.5, y: 10 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          },
        }}
      >
        <Users className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <motion.h3
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="mt-4 text-lg font-medium"
      >
        No staff members yet
      </motion.h3>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="mt-1 text-sm text-muted-foreground"
      >
        Staff members will appear here once they are added to your organization.
      </motion.p>
    </motion.div>
  );
}

/**
 * Animated staff table with staggered row animations
 */
function AnimatedStaffTable({ staff, orgId }: { staff: StaffListItem[]; orgId: string }) {
  const shouldReduceMotion = useReducedMotion();

  const tableContent = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Skills</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      {shouldReduceMotion ? (
        <tbody className="[&_tr:last-child]:border-0">
          {staff.map((member) => (
            <StaffRow key={member.id} member={member} orgId={orgId} />
          ))}
        </tbody>
      ) : (
        <motion.tbody
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.04,
                delayChildren: 0.1,
              },
            },
          }}
          className="[&_tr:last-child]:border-0"
        >
          {staff.map((member) => (
            <AnimatedStaffRow key={member.id} member={member} orgId={orgId} />
          ))}
        </motion.tbody>
      )}
    </Table>
  );

  if (shouldReduceMotion) {
    return <div className="rounded-lg border bg-card">{tableContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="rounded-lg border bg-card"
    >
      {tableContent}
    </motion.div>
  );
}

/**
 * Static staff row (for reduced motion)
 */
function StaffRow({ member, orgId }: { member: StaffListItem; orgId: string }) {
  const fullName =
    [member.user.first_name, member.user.last_name].filter(Boolean).join(' ') || member.user.email;
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const skills = member.skills.map((s) => s.skill);

  return (
    <TableRow>
      <TableCell>
        <a href={`/${orgId}/staff/${member.id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{fullName}</p>
            <p className="text-sm text-muted-foreground">{member.user.email}</p>
          </div>
        </a>
      </TableCell>
      <TableCell className="capitalize">{member.role.replace('_', ' ')}</TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>{member.status}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {skills.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 2}
            </Badge>
          )}
          {skills.length === 0 && <span className="text-sm text-muted-foreground">No skills</span>}
        </div>
      </TableCell>
      <TableCell>
        <StaffRowActions member={member} orgId={orgId} />
      </TableCell>
    </TableRow>
  );
}

/**
 * Animated staff row with fade + slide
 */
function AnimatedStaffRow({ member, orgId }: { member: StaffListItem; orgId: string }) {
  const fullName =
    [member.user.first_name, member.user.last_name].filter(Boolean).join(' ') || member.user.email;
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const skills = member.skills.map((s) => s.skill);

  return (
    <motion.tr
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.25,
            ease: EASE,
          },
        },
      }}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <TableCell>
        <a href={`/${orgId}/staff/${member.id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{fullName}</p>
            <p className="text-sm text-muted-foreground">{member.user.email}</p>
          </div>
        </a>
      </TableCell>
      <TableCell className="capitalize">{member.role.replace('_', ' ')}</TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>{member.status}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {skills.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{skills.length - 2}
            </Badge>
          )}
          {skills.length === 0 && <span className="text-sm text-muted-foreground">No skills</span>}
        </div>
      </TableCell>
      <TableCell>
        <StaffRowActions member={member} orgId={orgId} />
      </TableCell>
    </motion.tr>
  );
}

/**
 * Staff row dropdown actions
 */
function StaffRowActions({ member, orgId }: { member: StaffListItem; orgId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a href={`/${orgId}/staff/${member.id}`}>
            <User className="mr-2 h-4 w-4" />
            View Profile
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/${orgId}/staff/${member.id}/time`}>
            <Clock className="mr-2 h-4 w-4" />
            Time Tracking
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/${orgId}/staff/${member.id}/skills`}>
            <Award className="mr-2 h-4 w-4" />
            Manage Skills
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
