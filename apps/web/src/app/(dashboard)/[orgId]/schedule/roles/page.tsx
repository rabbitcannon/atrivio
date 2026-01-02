'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Palette, Tag } from 'lucide-react';
import { getScheduleRoles, type ScheduleRole } from '@/lib/api/client';

function RolesTableSkeleton() {
  return (
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
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ScheduleRolesPage() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const [roles, setRoles] = useState<ScheduleRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getScheduleRoles(orgId);

      if (apiError) {
        setError(apiError.message || 'Failed to load roles');
      } else if (data) {
        setRoles(data);
      }

      setLoading(false);
    }

    fetchRoles();
  }, [orgId]);

  // Group roles by active status
  const activeRoles = roles.filter((r) => r.is_active);
  const inactiveRoles = roles.filter((r) => !r.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Roles</h1>
        <p className="text-muted-foreground">
          View roles used for scheduling staff assignments.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <RolesTableSkeleton />
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Roles Found</h3>
            <p className="mt-1 text-sm text-muted-foreground text-center">
              Schedule roles will appear here once configured.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <CardTitle className="text-3xl text-muted-foreground">{inactiveRoles.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Roles Table */}
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
                  .map((role) => (
                    <TableRow key={role.id}>
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
                        <span className="text-muted-foreground">
                          {role.description || '—'}
                        </span>
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
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Color Legend */}
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
        </div>
      )}
    </div>
  );
}
