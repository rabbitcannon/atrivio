'use client';

import { AlertCircle, Palette, Tag } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getScheduleRoles, type ScheduleRole } from '@/lib/api/client';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Loading skeleton for roles page
 */
function RolesPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * Animated page header
 */
function AnimatedPageHeader({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  if (shouldReduceMotion) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Roles</h1>
        <p className="text-muted-foreground">View roles used for scheduling staff assignments.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <h1 className="text-3xl font-bold tracking-tight">Schedule Roles</h1>
      <p className="text-muted-foreground">View roles used for scheduling staff assignments.</p>
    </motion.div>
  );
}

/**
 * Animated stats grid
 */
function AnimatedStatsGrid({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>;
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
            staggerChildren: 0.06,
            delayChildren: 0.1,
          },
        },
      }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3, ease: EASE },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Animated content wrapper
 */
function AnimatedContent({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated empty state
 */
function AnimatedEmptyState({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  if (shouldReduceMotion) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Tag className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No Roles Found</h3>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Schedule roles will appear here once configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
            <Tag className="h-12 w-12 text-muted-foreground" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium">No Roles Found</h3>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            Schedule roles will appear here once configured.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Animated table row
 */
function AnimatedRoleRow({
  role,
  index,
  shouldReduceMotion,
}: {
  role: ScheduleRole;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  const content = (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
            style={{ backgroundColor: role.color }}
          >
            {role.name.charAt(0)}
          </div>
          <span className="font-medium">{role.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant="outline"
            style={{
              borderColor: role.color,
              color: role.color,
            }}
          >
            {role.color}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{role.description || '—'}</span>
      </TableCell>
      <TableCell>
        <Badge variant={role.is_active ? 'default' : 'secondary'}>
          {role.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-muted-foreground">{role.sort_order}</span>
      </TableCell>
    </TableRow>
  );

  if (shouldReduceMotion) {
    return content;
  }

  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: index * 0.03 }}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
            style={{ backgroundColor: role.color }}
          >
            {role.name.charAt(0)}
          </div>
          <span className="font-medium">{role.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant="outline"
            style={{
              borderColor: role.color,
              color: role.color,
            }}
          >
            {role.color}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{role.description || '—'}</span>
      </TableCell>
      <TableCell>
        <Badge variant={role.is_active ? 'default' : 'secondary'}>
          {role.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-muted-foreground">{role.sort_order}</span>
      </TableCell>
    </motion.tr>
  );
}

interface RolesContentProps {
  orgId: string;
}

export function RolesContent({ orgId }: RolesContentProps) {
  const shouldReduceMotion = useReducedMotion();

  const [roles, setRoles] = useState<ScheduleRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await getScheduleRoles(orgId);

    if (apiError) {
      setError(apiError.message || 'Failed to load roles');
    } else if (data) {
      setRoles(data);
    }

    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Group roles by active status
  const activeRoles = roles.filter((r) => r.is_active);
  const inactiveRoles = roles.filter((r) => !r.is_active);

  if (loading) {
    return <RolesPageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {roles.length === 0 ? (
        <AnimatedEmptyState shouldReduceMotion={shouldReduceMotion} />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion}>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Roles</CardDescription>
                <CardTitle className="text-3xl">{roles.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Roles</CardDescription>
                <CardTitle className="text-3xl text-green-600">{activeRoles.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Inactive Roles</CardDescription>
                <CardTitle className="text-3xl text-muted-foreground">
                  {inactiveRoles.length}
                </CardTitle>
              </CardHeader>
            </Card>
          </AnimatedStatsGrid>

          {/* Roles Table */}
          <AnimatedContent shouldReduceMotion={shouldReduceMotion}>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Sort Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((role, index) => (
                      <AnimatedRoleRow
                        key={role.id}
                        role={role}
                        index={index}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                </TableBody>
              </Table>
            </div>
          </AnimatedContent>

          {/* Color Legend */}
          <AnimatedContent shouldReduceMotion={shouldReduceMotion}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Color Legend</CardTitle>
                <CardDescription>
                  These colors are used to identify roles in the schedule calendar and views.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {activeRoles.map((role) => (
                    <Badge
                      key={role.id}
                      className="px-3 py-1"
                      style={{
                        backgroundColor: role.color,
                        color: 'white',
                      }}
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContent>
        </div>
      )}
    </div>
  );
}
