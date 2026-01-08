'use client';

import { AlertCircle, CheckCircle, MoreHorizontal, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
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
  addStaffCertification,
  getStaffCertifications,
  removeCertification,
  type StaffCertification,
  verifyCertification,
} from '@/lib/api/client';

interface CertificationsManagerProps {
  orgId: string;
  staffId: string;
}

// Common certification types for haunted attractions
const CERTIFICATION_TYPES = [
  { value: 'cpr', label: 'CPR' },
  { value: 'first_aid', label: 'First Aid' },
  { value: 'aed', label: 'AED' },
  { value: 'fire_safety', label: 'Fire Safety' },
  { value: 'food_handler', label: 'Food Handler' },
  { value: 'alcohol_server', label: 'Alcohol Server (TIPS/ServSafe)' },
  { value: 'crowd_management', label: 'Crowd Management' },
  { value: 'security', label: 'Security License' },
  { value: 'pyrotechnics', label: 'Pyrotechnics' },
  { value: 'forklift', label: 'Forklift Operator' },
  { value: 'other', label: 'Other' },
];

function CertificationsManagerSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function getCertificationStatus(cert: StaffCertification): {
  status: 'valid' | 'expiring_soon' | 'expired' | 'no_expiry';
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (!cert.expires_at) {
    return { status: 'no_expiry', label: 'No Expiry', variant: 'outline' };
  }

  const expiresAt = new Date(cert.expires_at);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (expiresAt < now) {
    return { status: 'expired', label: 'Expired', variant: 'destructive' };
  }
  if (expiresAt < thirtyDaysFromNow) {
    return { status: 'expiring_soon', label: 'Expiring Soon', variant: 'secondary' };
  }
  return { status: 'valid', label: 'Valid', variant: 'default' };
}

function getCertificationLabel(type: string): string {
  const found = CERTIFICATION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

export function CertificationsManager({ orgId, staffId }: CertificationsManagerProps) {
  const router = useRouter();
  const [certifications, setCertifications] = useState<StaffCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add certification form state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [certType, setCertType] = useState('');
  const [customType, setCustomType] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Remove dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [certToRemove, setCertToRemove] = useState<StaffCertification | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  // Verify loading state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  async function fetchCertifications() {
    setLoading(true);
    setError(null);

    const { data, error: apiError } = await getStaffCertifications(orgId, staffId);

    if (apiError) {
      setError(apiError.message || 'Failed to load certifications');
    } else if (data) {
      setCertifications(data.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchCertifications();
  }, []);

  function openAddDialog() {
    setCertType('');
    setCustomType('');
    setCertNumber('');
    setIssuedAt('');
    setExpiresAt('');
    setAddError(null);
    setAddDialogOpen(true);
  }

  async function handleAddCertification() {
    const type = certType === 'other' ? customType.trim() : certType;

    if (!type) {
      setAddError('Certification type is required');
      return;
    }

    if (!issuedAt) {
      setAddError('Issue date is required');
      return;
    }

    setAddLoading(true);
    setAddError(null);

    const data: {
      type: string;
      certificate_number?: string;
      issued_at: string;
      expires_at?: string;
    } = {
      type,
      issued_at: issuedAt,
    };

    if (certNumber.trim()) {
      data.certificate_number = certNumber.trim();
    }
    if (expiresAt) {
      data.expires_at = expiresAt;
    }

    const { data: result, error: apiError } = await addStaffCertification(orgId, staffId, data);

    if (apiError) {
      setAddError(apiError.message || 'Failed to add certification');
      setAddLoading(false);
      return;
    }

    if (result) {
      setCertifications((prev) => [...prev, result]);
    }

    setAddLoading(false);
    setAddDialogOpen(false);
    router.refresh();
  }

  function openRemoveDialog(cert: StaffCertification) {
    setCertToRemove(cert);
    setRemoveError(null);
    setRemoveDialogOpen(true);
  }

  async function handleRemoveCertification() {
    if (!certToRemove) return;

    setRemoveLoading(true);
    setRemoveError(null);

    const { error: apiError } = await removeCertification(orgId, staffId, certToRemove.id);

    if (apiError) {
      setRemoveError(apiError.message || 'Failed to remove certification');
      setRemoveLoading(false);
      return;
    }

    setCertifications((prev) => prev.filter((c) => c.id !== certToRemove.id));

    setRemoveLoading(false);
    setRemoveDialogOpen(false);
    setCertToRemove(null);
    router.refresh();
  }

  async function handleVerifyCertification(cert: StaffCertification) {
    setVerifyingId(cert.id);

    const { data: result, error: apiError } = await verifyCertification(orgId, staffId, cert.id);

    if (apiError) {
    } else if (result) {
      setCertifications((prev) => prev.map((c) => (c.id === cert.id ? result : c)));
    }

    setVerifyingId(null);
    router.refresh();
  }

  if (loading) {
    return <CertificationsManagerSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading certifications</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Certifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Current Certifications ({certifications.length})
          </h2>
          {certifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No certifications on record.</p>
              </CardContent>
            </Card>
          ) : (
            certifications.map((cert) => {
              const { label, variant } = getCertificationStatus(cert);
              const isVerifying = verifyingId === cert.id;

              return (
                <Card key={cert.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {getCertificationLabel(cert.type)}
                        </CardTitle>
                        {cert.verified && <ShieldCheck className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={variant}>{label}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isVerifying}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!cert.verified && (
                              <DropdownMenuItem
                                onClick={() => handleVerifyCertification(cert)}
                                disabled={isVerifying}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openRemoveDialog(cert)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    {cert.certificate_number && <p>Certificate #: {cert.certificate_number}</p>}
                    {cert.issued_at && (
                      <p>Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                    )}
                    {cert.expires_at && (
                      <p>Expires: {new Date(cert.expires_at).toLocaleDateString()}</p>
                    )}
                    {cert.verified && cert.verified_by && (
                      <p className="text-green-600">
                        Verified by {cert.verified_by.name} on{' '}
                        {cert.verified_at ? new Date(cert.verified_at).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Add Certification */}
        <Card>
          <CardHeader>
            <CardTitle>Add Certification</CardTitle>
            <CardDescription>Add a new certification record for this staff member.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Certification
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Certification Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certification</DialogTitle>
            <DialogDescription>
              Add a new certification with issue and expiration dates.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {addError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {addError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cert-type">Certification Type</Label>
              <Select value={certType} onValueChange={setCertType} disabled={addLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {certType === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="custom-type">Custom Type</Label>
                <Input
                  id="custom-type"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Enter certification name"
                  disabled={addLoading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="cert-number">Certificate Number (optional)</Label>
              <Input
                id="cert-number"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="e.g., CPR-2024-67890"
                disabled={addLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issued-at">Issue Date</Label>
                <Input
                  id="issued-at"
                  type="date"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                  disabled={addLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires-at">Expiration Date (optional)</Label>
                <Input
                  id="expires-at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={addLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCertification}
              disabled={
                addLoading || !certType || (certType === 'other' && !customType.trim()) || !issuedAt
              }
            >
              {addLoading ? 'Adding...' : 'Add Certification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Certification Dialog */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Certification</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the{' '}
              <span className="font-medium">
                {certToRemove ? getCertificationLabel(certToRemove.type) : ''}
              </span>{' '}
              certification? This action cannot be undone.
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
            <Button
              variant="destructive"
              onClick={handleRemoveCertification}
              disabled={removeLoading}
            >
              {removeLoading ? 'Removing...' : 'Remove Certification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
