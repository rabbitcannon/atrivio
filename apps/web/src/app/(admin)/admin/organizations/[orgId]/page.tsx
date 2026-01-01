'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  Ticket,
  CreditCard,
  AlertCircle,
  Percent,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getAdminOrganization,
  getOrgPlatformFee,
  setOrgPlatformFee,
  type AdminOrgDetail,
  type OrgPlatformFee,
} from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'suspended':
      return 'destructive';
    case 'deleted':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function AdminOrganizationDetailPage() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const [org, setOrg] = useState<AdminOrgDetail | null>(null);
  const [platformFee, setPlatformFee] = useState<OrgPlatformFee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fee editor state
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [feeValue, setFeeValue] = useState<string>('');
  const [useDefault, setUseDefault] = useState(true);
  const [isSavingFee, setIsSavingFee] = useState(false);
  const [feeSuccess, setFeeSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const [orgResult, feeResult] = await Promise.all([
        getAdminOrganization(orgId),
        getOrgPlatformFee(orgId),
      ]);

      if (orgResult.error) {
        setError(orgResult.error.message);
      } else if (orgResult.data) {
        setOrg(orgResult.data);
      }

      if (feeResult.data) {
        setPlatformFee(feeResult.data);
        setUseDefault(!feeResult.data.is_custom);
        setFeeValue(feeResult.data.custom_fee?.toString() || feeResult.data.global_default.toString());
      }

      setIsLoading(false);
    }

    fetchData();
  }, [orgId]);

  const handleSaveFee = async () => {
    setIsSavingFee(true);
    setFeeSuccess(false);

    const newFee = useDefault ? null : parseFloat(feeValue);
    const result = await setOrgPlatformFee(orgId, { platform_fee_percent: newFee });

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setPlatformFee(result.data);
      setFeeSuccess(true);
      setIsEditingFee(false);
      setTimeout(() => setFeeSuccess(false), 3000);
    }

    setIsSavingFee(false);
  };

  const handleCancelEdit = () => {
    setIsEditingFee(false);
    if (platformFee) {
      setUseDefault(!platformFee.is_custom);
      setFeeValue(platformFee.custom_fee?.toString() || platformFee.global_default.toString());
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/organizations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Organizations
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Organization not found</AlertTitle>
          <AlertDescription>{error || 'The organization could not be found.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/organizations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">{org.name}</h1>
              <p className="text-sm text-muted-foreground">{org.slug}</p>
            </div>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(org.status)} className="text-sm">
          {org.status}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {feeSuccess && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Platform fee updated successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="font-medium">{org.owner?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{org.owner?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(org.created_at)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{org.member_count}</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{org.attraction_count}</p>
                  <p className="text-xs text-muted-foreground">Attractions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{org.stripe_connected ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-muted-foreground">Stripe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Fee */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Platform Fee
                </CardTitle>
                <CardDescription>
                  Fee percentage taken from each transaction
                </CardDescription>
              </div>
              {!isEditingFee && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingFee(true)}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {platformFee && !isEditingFee && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Fee</span>
                  <span className="text-3xl font-bold">{platformFee.platform_fee_percent}%</span>
                </div>
                <div className="text-sm">
                  {platformFee.is_custom ? (
                    <Badge variant="secondary">Custom Rate</Badge>
                  ) : (
                    <Badge variant="outline">Using Default ({platformFee.global_default}%)</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  On a $100 transaction, the platform takes ${(100 * platformFee.platform_fee_percent / 100).toFixed(2)}
                </p>
              </div>
            )}

            {isEditingFee && platformFee && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={useDefault}
                        onChange={() => setUseDefault(true)}
                        className="h-4 w-4"
                      />
                      <span>Use default ({platformFee.global_default}%)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!useDefault}
                        onChange={() => setUseDefault(false)}
                        className="h-4 w-4"
                      />
                      <span>Custom rate</span>
                    </label>
                  </div>
                </div>

                {!useDefault && (
                  <div className="space-y-2">
                    <Label htmlFor="feePercent">Custom Fee Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="feePercent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={feeValue}
                        onChange={(e) => setFeeValue(e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter a value between 0 and 100
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveFee} disabled={isSavingFee}>
                    {isSavingFee && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} disabled={isSavingFee}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>{org.members.length} team members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {org.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name || 'Unknown'}
                    {member.is_owner && (
                      <Badge variant="secondary" className="ml-2">
                        Owner
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                </TableRow>
              ))}
              {org.members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attractions */}
      {org.attractions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attractions</CardTitle>
            <CardDescription>{org.attractions.length} attractions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {org.attractions.map((attraction) => (
                  <TableRow key={attraction.id}>
                    <TableCell className="font-medium">{attraction.name}</TableCell>
                    <TableCell>
                      <Badge variant={attraction.status === 'active' ? 'default' : 'secondary'}>
                        {attraction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
