'use client';

import { Copy, MoreHorizontal, Pencil, Percent, Plus, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

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

/**
 * Loading skeleton for promo codes page
 */
function PromoCodesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 py-3">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Animated page header with fade-down effect
 */
function AnimatedPageHeader({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="flex items-center justify-between">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-center justify-between"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated table card container
 */
function AnimatedTableCard({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <Card>{children}</Card>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
    >
      <Card>{children}</Card>
    </motion.div>
  );
}

/**
 * Animated empty state with bouncing icon
 */
function AnimatedEmptyState({
  shouldReduceMotion,
  onCreateClick,
}: {
  shouldReduceMotion: boolean | null;
  onCreateClick: () => void;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No promo codes created yet.</p>
        <Button variant="outline" className="mt-4" onClick={onCreateClick}>
          Create Your First Promo Code
        </Button>
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
      className="text-center py-12 text-muted-foreground"
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
        <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
      </motion.div>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
      >
        No promo codes created yet.
      </motion.p>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
      >
        <Button variant="outline" className="mt-4" onClick={onCreateClick}>
          Create Your First Promo Code
        </Button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Promo code row props interface
 */
interface PromoRowProps {
  code: PromoCode;
  formatDiscount: (code: PromoCode) => string;
  formatDate: (dateStr: string | null) => string;
  isExpired: (code: PromoCode) => boolean;
  isNotYetValid: (code: PromoCode) => boolean;
  copyToClipboard: (code: string) => void;
  openEditDialog: (code: PromoCode) => void;
  handleToggleActive: (code: PromoCode) => void;
  handleDelete: (code: PromoCode) => void;
}

/**
 * Static promo row (for reduced motion)
 */
function PromoRow({
  code,
  formatDiscount,
  formatDate,
  isExpired,
  isNotYetValid,
  copyToClipboard,
  openEditDialog,
  handleToggleActive,
  handleDelete,
}: PromoRowProps) {
  return (
    <TableRow>
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
          <div className="text-sm text-muted-foreground">{code.description}</div>
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
          <span className={code.times_used >= code.max_uses ? 'text-destructive' : ''}>
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
        <PromoStatusBadge
          code={code}
          isExpired={isExpired}
          isNotYetValid={isNotYetValid}
        />
      </TableCell>
      <TableCell>
        <PromoRowActions
          code={code}
          openEditDialog={openEditDialog}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
}

/**
 * Animated promo row with fade + slide
 */
function AnimatedPromoRow({
  code,
  formatDiscount,
  formatDate,
  isExpired,
  isNotYetValid,
  copyToClipboard,
  openEditDialog,
  handleToggleActive,
  handleDelete,
}: PromoRowProps) {
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
          <div className="text-sm text-muted-foreground">{code.description}</div>
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
          <span className={code.times_used >= code.max_uses ? 'text-destructive' : ''}>
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
        <PromoStatusBadge
          code={code}
          isExpired={isExpired}
          isNotYetValid={isNotYetValid}
        />
      </TableCell>
      <TableCell>
        <PromoRowActions
          code={code}
          openEditDialog={openEditDialog}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
        />
      </TableCell>
    </motion.tr>
  );
}

/**
 * Promo code status badge
 */
function PromoStatusBadge({
  code,
  isExpired,
  isNotYetValid,
}: {
  code: PromoCode;
  isExpired: (code: PromoCode) => boolean;
  isNotYetValid: (code: PromoCode) => boolean;
}) {
  if (!code.is_active) {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  if (isExpired(code)) {
    return <Badge variant="destructive">Expired</Badge>;
  }
  if (isNotYetValid(code)) {
    return <Badge variant="outline">Scheduled</Badge>;
  }
  if (code.max_uses && code.times_used >= code.max_uses) {
    return <Badge variant="destructive">Exhausted</Badge>;
  }
  return <Badge variant="default">Active</Badge>;
}

/**
 * Promo row dropdown actions
 */
function PromoRowActions({
  code,
  openEditDialog,
  handleToggleActive,
  handleDelete,
}: {
  code: PromoCode;
  openEditDialog: (code: PromoCode) => void;
  handleToggleActive: (code: PromoCode) => void;
  handleDelete: (code: PromoCode) => void;
}) {
  return (
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
        <DropdownMenuItem onClick={() => handleDelete(code)} className="text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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

  const loadPromoCodes = useCallback(async (orgId: string) => {
    try {
      // apiClientDirect returns data directly, not wrapped
      const response = await apiClient.get<PromoCode[]>(
        `/organizations/${orgId}/promo-codes?includeInactive=true`
      );
      setPromoCodes(response || []);
    } catch (_error) {}
  }, []);

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
  }, [orgIdentifier, loadPromoCodes]);

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
      minOrderAmount: code.min_order_amount ? String(code.min_order_amount / 100) : '',
      maxDiscount: code.max_discount ? String(code.max_discount / 100) : '',
      maxUses: code.max_uses ? String(code.max_uses) : '',
      maxUsesPerCustomer: code.max_uses_per_customer ? String(code.max_uses_per_customer) : '',
      validFrom: code.valid_from ? (code.valid_from.split('T')[0] ?? '') : '',
      validUntil: code.valid_until ? (code.valid_until.split('T')[0] ?? '') : '',
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
      // Map 'fixed' to 'fixed_amount' for API (API uses snake_case enum)
      discountType: formData.discountType === 'fixed' ? 'fixed_amount' : formData.discountType,
      discountValue:
        formData.discountType === 'percentage'
          ? parseInt(formData.discountValue, 10)
          : Math.round(parseFloat(formData.discountValue) * 100),
      minOrderAmount: formData.minOrderAmount
        ? Math.round(parseFloat(formData.minOrderAmount) * 100)
        : undefined,
      maxDiscount: formData.maxDiscount
        ? Math.round(parseFloat(formData.maxDiscount) * 100)
        : undefined,
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
      maxUsesPerCustomer: formData.maxUsesPerCustomer
        ? parseInt(formData.maxUsesPerCustomer, 10)
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
    } catch (_error) {
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
      await apiClient.patch(`/organizations/${resolvedOrgId}/promo-codes/${code.id}`, {
        isActive: !code.is_active,
      });
      toast({
        title: code.is_active ? 'Promo code deactivated' : 'Promo code activated',
      });
      await loadPromoCodes(resolvedOrgId);
    } catch (_error) {
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
      await apiClient.delete(`/organizations/${resolvedOrgId}/promo-codes/${code.id}`);
      toast({ title: 'Promo code deleted' });
      await loadPromoCodes(resolvedOrgId);
    } catch (_error) {
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

  const shouldReduceMotion = useReducedMotion();

  if (isLoading) {
    return <PromoCodesLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion}>
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promo Code
        </Button>
      </AnimatedPageHeader>

      <AnimatedTableCard shouldReduceMotion={shouldReduceMotion}>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
          <CardDescription>
            {promoCodes.length} promo code{promoCodes.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {promoCodes.length === 0 ? (
            <AnimatedEmptyState
              shouldReduceMotion={shouldReduceMotion}
              onCreateClick={openCreateDialog}
            />
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
              {shouldReduceMotion ? (
                <TableBody>
                  {promoCodes.map((code) => (
                    <PromoRow
                      key={code.id}
                      code={code}
                      formatDiscount={formatDiscount}
                      formatDate={formatDate}
                      isExpired={isExpired}
                      isNotYetValid={isNotYetValid}
                      copyToClipboard={copyToClipboard}
                      openEditDialog={openEditDialog}
                      handleToggleActive={handleToggleActive}
                      handleDelete={handleDelete}
                    />
                  ))}
                </TableBody>
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
                  {promoCodes.map((code) => (
                    <AnimatedPromoRow
                      key={code.id}
                      code={code}
                      formatDiscount={formatDiscount}
                      formatDate={formatDate}
                      isExpired={isExpired}
                      isNotYetValid={isNotYetValid}
                      copyToClipboard={copyToClipboard}
                      openEditDialog={openEditDialog}
                      handleToggleActive={handleToggleActive}
                      handleDelete={handleDelete}
                    />
                  ))}
                </motion.tbody>
              )}
            </Table>
          )}
        </CardContent>
      </AnimatedTableCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCode ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
            <DialogDescription>Configure the promo code details and discount.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER2024"
                  className="font-mono"
                  disabled={!!editingCode}
                />
                {!editingCode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.code || !formData.discountValue}>
              {editingCode ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
