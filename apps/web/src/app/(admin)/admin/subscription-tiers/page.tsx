'use client';

import { AlertCircle, CreditCard, Edit, Save, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  getSubscriptionTiers,
  type SubscriptionTierConfig,
  updateSubscriptionTier,
  type UpdateSubscriptionTierParams,
} from '@/lib/api/admin';

function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : value.toString();
}

export default function AdminSubscriptionTiersPage() {
  const [tiers, setTiers] = useState<SubscriptionTierConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTierConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    monthlyPriceCents: string;
    transactionFeePercentage: string;
    transactionFeeFixedCents: string;
    customDomainsLimit: string;
    attractionsLimit: string;
    staffMembersLimit: string;
    features: string;
    isActive: boolean;
    stripePriceId: string;
  }>({
    name: '',
    description: '',
    monthlyPriceCents: '',
    transactionFeePercentage: '',
    transactionFeeFixedCents: '',
    customDomainsLimit: '',
    attractionsLimit: '',
    staffMembersLimit: '',
    features: '',
    isActive: true,
    stripePriceId: '',
  });

  async function fetchTiers() {
    setIsLoading(true);
    const result = await getSubscriptionTiers();

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setTiers(result.data.tiers);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchTiers();
  }, []);

  const openEditDialog = (tier: SubscriptionTierConfig) => {
    setSelectedTier(tier);
    setEditForm({
      name: tier.name,
      description: tier.description,
      monthlyPriceCents: tier.monthlyPriceCents.toString(),
      transactionFeePercentage: tier.transactionFeePercentage.toString(),
      transactionFeeFixedCents: tier.transactionFeeFixedCents.toString(),
      customDomainsLimit: tier.limits.customDomains.toString(),
      attractionsLimit: tier.limits.attractions.toString(),
      staffMembersLimit: tier.limits.staffMembers.toString(),
      features: tier.features.join(', '),
      isActive: tier.isActive,
      stripePriceId: tier.stripePriceId || '',
    });
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTier) return;

    setIsSaving(true);
    setError(null);

    const updates: UpdateSubscriptionTierParams = {};

    if (editForm.name !== selectedTier.name) updates.name = editForm.name;
    if (editForm.description !== selectedTier.description) updates.description = editForm.description;

    const monthlyPriceCents = parseInt(editForm.monthlyPriceCents, 10);
    if (!isNaN(monthlyPriceCents) && monthlyPriceCents !== selectedTier.monthlyPriceCents) {
      updates.monthly_price_cents = monthlyPriceCents;
    }

    const transactionFeePercentage = parseFloat(editForm.transactionFeePercentage);
    if (!isNaN(transactionFeePercentage) && transactionFeePercentage !== selectedTier.transactionFeePercentage) {
      updates.transaction_fee_percentage = transactionFeePercentage;
    }

    const transactionFeeFixedCents = parseInt(editForm.transactionFeeFixedCents, 10);
    if (!isNaN(transactionFeeFixedCents) && transactionFeeFixedCents !== selectedTier.transactionFeeFixedCents) {
      updates.transaction_fee_fixed_cents = transactionFeeFixedCents;
    }

    const customDomainsLimit = parseInt(editForm.customDomainsLimit, 10);
    if (!isNaN(customDomainsLimit) && customDomainsLimit !== selectedTier.limits.customDomains) {
      updates.custom_domains_limit = customDomainsLimit;
    }

    const attractionsLimit = parseInt(editForm.attractionsLimit, 10);
    if (!isNaN(attractionsLimit) && attractionsLimit !== selectedTier.limits.attractions) {
      updates.attractions_limit = attractionsLimit;
    }

    const staffMembersLimit = parseInt(editForm.staffMembersLimit, 10);
    if (!isNaN(staffMembersLimit) && staffMembersLimit !== selectedTier.limits.staffMembers) {
      updates.staff_members_limit = staffMembersLimit;
    }

    const features = editForm.features.split(',').map((f) => f.trim()).filter((f) => f);
    if (JSON.stringify(features) !== JSON.stringify(selectedTier.features)) {
      updates.features = features;
    }

    if (editForm.isActive !== selectedTier.isActive) {
      updates.is_active = editForm.isActive;
    }

    // Handle stripe_price_id (can be empty string to clear, or a price_xxx value)
    const currentStripePriceId = selectedTier.stripePriceId || '';
    if (editForm.stripePriceId !== currentStripePriceId) {
      updates.stripe_price_id = editForm.stripePriceId || null;
    }

    // Only send if there are changes
    if (Object.keys(updates).length === 0) {
      setIsEditOpen(false);
      setSelectedTier(null);
      setIsSaving(false);
      return;
    }

    const result = await updateSubscriptionTier(selectedTier.tier, updates);

    if (result.error) {
      setError(result.error.message);
    } else {
      await fetchTiers();
      setIsEditOpen(false);
      setSelectedTier(null);
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Tiers</h1>
        <p className="text-muted-foreground">
          Configure pricing, limits, and features for each subscription tier
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tier Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.tier} className={!tier.isActive ? 'opacity-60' : ''}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {tier.name}
                    {!tier.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{tier.description}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(tier)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit {tier.name}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div>
                <p className="text-3xl font-bold">{tier.monthlyPrice}</p>
                <p className="text-sm text-muted-foreground">/month</p>
              </div>

              {/* Transaction Fees */}
              <div className="text-sm">
                <span className="font-medium">Transaction Fee:</span>{' '}
                <span className="text-muted-foreground">{tier.transactionFee}</span>
              </div>

              {/* Limits */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Limits</p>
                <Table>
                  <TableBody className="text-sm">
                    <TableRow>
                      <TableCell className="py-1.5 pl-0">Attractions</TableCell>
                      <TableCell className="py-1.5 pr-0 text-right font-medium">
                        {formatLimit(tier.limits.attractions)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-1.5 pl-0">Staff Members</TableCell>
                      <TableCell className="py-1.5 pr-0 text-right font-medium">
                        {formatLimit(tier.limits.staffMembers)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-1.5 pl-0">Custom Domains</TableCell>
                      <TableCell className="py-1.5 pr-0 text-right font-medium">
                        {formatLimit(tier.limits.customDomains)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Features ({tier.features.length})</p>
                <div className="flex flex-wrap gap-1">
                  {tier.features.slice(0, 5).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {tier.features.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tier.features.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Organizations Count */}
              {tier.organizationsCount !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {tier.organizationsCount} organization{tier.organizationsCount !== 1 ? 's' : ''} on this tier
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tier Comparison</CardTitle>
          <CardDescription>Quick overview of all subscription tier limits</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Transaction Fee</TableHead>
                <TableHead className="text-right">Attractions</TableHead>
                <TableHead className="text-right">Staff</TableHead>
                <TableHead className="text-right">Custom Domains</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.tier}>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell className="text-right">{tier.monthlyPrice}</TableCell>
                  <TableCell className="text-right">{tier.transactionFee}</TableCell>
                  <TableCell className="text-right">{formatLimit(tier.limits.attractions)}</TableCell>
                  <TableCell className="text-right">{formatLimit(tier.limits.staffMembers)}</TableCell>
                  <TableCell className="text-right">{formatLimit(tier.limits.customDomains)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={tier.isActive ? 'default' : 'secondary'}>
                      {tier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {selectedTier?.name} Tier</DialogTitle>
            <DialogDescription>
              Update the configuration for this subscription tier. Changes will affect all organizations on this tier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 self-end">
                <Switch
                  id="isActive"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isActive: checked })}
                />
                <Label htmlFor="isActive">Tier Active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            {/* Pricing */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="monthlyPriceCents">Monthly Price (cents)</Label>
                <Input
                  id="monthlyPriceCents"
                  type="number"
                  value={editForm.monthlyPriceCents}
                  onChange={(e) => setEditForm({ ...editForm, monthlyPriceCents: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  ${(parseInt(editForm.monthlyPriceCents, 10) || 0) / 100}/mo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionFeePercentage">Transaction Fee %</Label>
                <Input
                  id="transactionFeePercentage"
                  type="number"
                  step="0.01"
                  value={editForm.transactionFeePercentage}
                  onChange={(e) => setEditForm({ ...editForm, transactionFeePercentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionFeeFixedCents">Fixed Fee (cents)</Label>
                <Input
                  id="transactionFeeFixedCents"
                  type="number"
                  value={editForm.transactionFeeFixedCents}
                  onChange={(e) => setEditForm({ ...editForm, transactionFeeFixedCents: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  ${(parseInt(editForm.transactionFeeFixedCents, 10) || 0) / 100} per transaction
                </p>
              </div>
            </div>

            {/* Limits */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="attractionsLimit">Attractions Limit</Label>
                <Input
                  id="attractionsLimit"
                  type="number"
                  value={editForm.attractionsLimit}
                  onChange={(e) => setEditForm({ ...editForm, attractionsLimit: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Use -1 for unlimited</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffMembersLimit">Staff Members Limit</Label>
                <Input
                  id="staffMembersLimit"
                  type="number"
                  value={editForm.staffMembersLimit}
                  onChange={(e) => setEditForm({ ...editForm, staffMembersLimit: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Use -1 for unlimited</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customDomainsLimit">Custom Domains Limit</Label>
                <Input
                  id="customDomainsLimit"
                  type="number"
                  value={editForm.customDomainsLimit}
                  onChange={(e) => setEditForm({ ...editForm, customDomainsLimit: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Use -1 for unlimited</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Textarea
                id="features"
                value={editForm.features}
                onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                placeholder="ticketing, checkin, time_tracking, notifications"
              />
              <p className="text-xs text-muted-foreground">
                Feature flag keys that are enabled for organizations on this tier
              </p>
            </div>

            {/* Stripe Integration */}
            {selectedTier?.tier !== 'free' && (
              <div className="space-y-2">
                <Label htmlFor="stripePriceId">Stripe Price ID</Label>
                <Input
                  id="stripePriceId"
                  value={editForm.stripePriceId}
                  onChange={(e) => setEditForm({ ...editForm, stripePriceId: e.target.value })}
                  placeholder="price_xxxxxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Create a recurring subscription product in Stripe Dashboard and paste the Price ID here.
                  Required for subscription upgrades to this tier.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
