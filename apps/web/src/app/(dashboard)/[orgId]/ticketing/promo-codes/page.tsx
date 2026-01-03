'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, MoreHorizontal, Percent, Copy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  times_used: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export default function PromoCodesPage() {
  const params = useParams();
  const orgIdentifier = params['orgId'] as string;
  const { toast } = useToast();

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    maxUses: '',
    maxUsesPerCustomer: '',
    validFrom: '',
    validUntil: '',
  });

  useEffect(() => {
    async function init() {
      const orgId = await resolveOrgId(orgIdentifier);
      if (orgId) {
        setResolvedOrgId(orgId);
        await loadPromoCodes(orgId);
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier]);

  async function loadPromoCodes(orgId: string) {
    try {
      const response = await apiClient.get<{ data: PromoCode[] }>(
        `/organizations/${orgId}/promo-codes?includeInactive=true`
      );
      setPromoCodes(response?.data || []);
    } catch (error) {
      console.error('Failed to load promo codes:', error);
    }
  }

  function formatDiscount(code: PromoCode): string {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}%`;
    }
    return `$${(code.discount_value / 100).toFixed(2)}`;
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function isExpired(code: PromoCode): boolean {
    if (!code.valid_until) return false;
    return new Date(code.valid_until) < new Date();
  }

  function isNotYetValid(code: PromoCode): boolean {
    if (!code.valid_from) return false;
    return new Date(code.valid_from) > new Date();
  }

  function openCreateDialog() {
    setEditingCode(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      maxUses: '',
      maxUsesPerCustomer: '',
      validFrom: '',
      validUntil: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(code: PromoCode) {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description || '',
      discountType: code.discount_type,
      discountValue:
        code.discount_type === 'percentage'
          ? String(code.discount_value)
          : String(code.discount_value / 100),
      minOrderAmount: code.min_order_amount
        ? String(code.min_order_amount / 100)
        : '',
      maxDiscount: code.max_discount ? String(code.max_discount / 100) : '',
      maxUses: code.max_uses ? String(code.max_uses) : '',
      maxUsesPerCustomer: code.max_uses_per_customer
        ? String(code.max_uses_per_customer)
        : '',
      validFrom: code.valid_from ? code.valid_from.split('T')[0] ?? '' : '',
      validUntil: code.valid_until ? code.valid_until.split('T')[0] ?? '' : '',
    });
    setIsDialogOpen(true);
  }

  function generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async function handleSubmit() {
    if (!resolvedOrgId) return;

    const payload = {
      code: formData.code.toUpperCase(),
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue:
        formData.discountType === 'percentage'
          ? parseInt(formData.discountValue)
          : Math.round(parseFloat(formData.discountValue) * 100),
      minOrderAmount: formData.minOrderAmount
        ? Math.round(parseFloat(formData.minOrderAmount) * 100)
        : undefined,
      maxDiscount: formData.maxDiscount
        ? Math.round(parseFloat(formData.maxDiscount) * 100)
        : undefined,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      maxUsesPerCustomer: formData.maxUsesPerCustomer
        ? parseInt(formData.maxUsesPerCustomer)
        : undefined,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
    };

    try {
      if (editingCode) {
        await apiClient.patch(
          `/organizations/${resolvedOrgId}/promo-codes/${editingCode.id}`,
          payload
        );
        toast({ title: 'Promo code updated' });
      } else {
        await apiClient.post(`/organizations/${resolvedOrgId}/promo-codes`, payload);
        toast({ title: 'Promo code created' });
      }
      setIsDialogOpen(false);
      await loadPromoCodes(resolvedOrgId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save promo code',
        variant: 'destructive',
      });
    }
  }

  async function handleToggleActive(code: PromoCode) {
    if (!resolvedOrgId) return;

    try {
      await apiClient.patch(
        `/organizations/${resolvedOrgId}/promo-codes/${code.id}`,
        { isActive: !code.is_active }
      );
      toast({
        title: code.is_active ? 'Promo code deactivated' : 'Promo code activated',
      });
      await loadPromoCodes(resolvedOrgId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update promo code',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(code: PromoCode) {
    if (!resolvedOrgId) return;
    if (!confirm(`Delete promo code "${code.code}"?`)) return;

    try {
      await apiClient.delete(
        `/organizations/${resolvedOrgId}/promo-codes/${code.id}`
      );
      toast({ title: 'Promo code deleted' });
      await loadPromoCodes(resolvedOrgId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Cannot delete promo code that has been used',
        variant: 'destructive',
      });
    }
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    toast({ title: `Copied "${code}" to clipboard` });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">
            Create and manage promotional discount codes.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>
            {promoCodes.length} promo code{promoCodes.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {promoCodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No promo codes created yet.</p>
              <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                Create Your First Promo Code
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="text-right">Uses</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{code.code}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {code.description && (
                        <div className="text-sm text-muted-foreground">
                          {code.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatDiscount(code)}</div>
                      {code.min_order_amount && (
                        <div className="text-sm text-muted-foreground">
                          Min: ${(code.min_order_amount / 100).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {code.max_uses ? (
                        <span
                          className={
                            code.times_used >= code.max_uses ? 'text-destructive' : ''
                          }
                        >
                          {code.times_used} / {code.max_uses}
                        </span>
                      ) : (
                        <span>{code.times_used}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {code.valid_from || code.valid_until ? (
                        <>
                          {formatDate(code.valid_from)} - {formatDate(code.valid_until)}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Always valid</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!code.is_active ? (
                        <Badge variant="secondary">Inactive</Badge>
                      ) : isExpired(code) ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : isNotYetValid(code) ? (
                        <Badge variant="outline">Scheduled</Badge>
                      ) : code.max_uses && code.times_used >= code.max_uses ? (
                        <Badge variant="destructive">Exhausted</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(code)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleActive(code)}>
                            {code.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(code)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'Edit Promo Code' : 'Create Promo Code'}
            </DialogTitle>
            <DialogDescription>
              Configure the promo code details and discount.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER2024"
                  className="font-mono"
                  disabled={!!editingCode}
                />
                {!editingCode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({ ...formData, code: generateRandomCode() })
                    }
                  >
                    Generate
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Summer sale discount..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v: 'percentage' | 'fixed') =>
                    setFormData({ ...formData, discountType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discountValue">
                  {formData.discountType === 'percentage' ? 'Percentage' : 'Amount ($)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                  placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minOrderAmount">Min Order ($)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                  placeholder="No minimum"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: e.target.value })
                  }
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxUses">Max Total Uses</Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  placeholder="Unlimited"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxUsesPerCustomer">Max Per Customer</Label>
                <Input
                  id="maxUsesPerCustomer"
                  type="number"
                  min="1"
                  value={formData.maxUsesPerCustomer}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsesPerCustomer: e.target.value })
                  }
                  placeholder="Unlimited"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.code || !formData.discountValue}
            >
              {editingCode ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
