'use client';

import { AlertCircle, Edit, MoreHorizontal, Plus, Shield, Trash2 } from 'lucide-react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createRateLimit,
  deleteRateLimit,
  getRateLimits,
  type RateLimitRule,
  updateRateLimit,
} from '@/lib/api/admin';

type AppliesTo = 'all' | 'authenticated' | 'anonymous' | 'specific_orgs';

interface NewRuleForm {
  name: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number | null;
  burst_limit: number | null;
  applies_to: AppliesTo;
}

const defaultNewRule: NewRuleForm = {
  name: '',
  endpoint_pattern: '',
  requests_per_minute: 60,
  requests_per_hour: null,
  burst_limit: null,
  applies_to: 'all',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminRateLimitsPage() {
  const [rules, setRules] = useState<RateLimitRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RateLimitRule | null>(null);
  const [newRule, setNewRule] = useState<NewRuleForm>(defaultNewRule);
  const [editForm, setEditForm] = useState<{
    requests_per_minute: number;
    requests_per_hour: number | null;
    burst_limit: number | null;
  }>({ requests_per_minute: 60, requests_per_hour: null, burst_limit: null });

  async function fetchRules() {
    setIsLoading(true);
    setError(null);
    const result = await getRateLimits();

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setRules(result.data.rules || []);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (rule: RateLimitRule) => {
    // Optimistically update local state to preserve order
    const newEnabled = !rule.enabled;
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, enabled: newEnabled } : r))
    );

    const result = await updateRateLimit(rule.id, { enabled: newEnabled });

    if (result.error) {
      // Revert on error
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, enabled: rule.enabled } : r))
      );
      setError(result.error.message);
    }
  };

  const handleCreate = async () => {
    if (!newRule.name.trim() || !newRule.endpoint_pattern.trim()) return;

    const data: Parameters<typeof createRateLimit>[0] = {
      name: newRule.name.trim(),
      endpoint_pattern: newRule.endpoint_pattern.trim(),
      requests_per_minute: newRule.requests_per_minute,
      applies_to: newRule.applies_to,
    };
    if (newRule.requests_per_hour) data.requests_per_hour = newRule.requests_per_hour;
    if (newRule.burst_limit) data.burst_limit = newRule.burst_limit;

    const result = await createRateLimit(data);

    if (result.error) {
      setError(result.error.message);
    } else {
      fetchRules();
      setIsCreateOpen(false);
      setNewRule(defaultNewRule);
    }
  };

  const handleEdit = async () => {
    if (!selectedRule) return;

    const result = await updateRateLimit(selectedRule.id, {
      requests_per_minute: editForm.requests_per_minute,
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      fetchRules();
      setIsEditOpen(false);
      setSelectedRule(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedRule) return;

    const result = await deleteRateLimit(selectedRule.id);

    if (result.error) {
      setError(result.error.message);
    } else {
      fetchRules();
    }

    setIsDeleteOpen(false);
    setSelectedRule(null);
  };

  const openEditDialog = (rule: RateLimitRule) => {
    setSelectedRule(rule);
    setEditForm({
      requests_per_minute: rule.requests_per_minute,
      requests_per_hour: rule.requests_per_hour,
      burst_limit: rule.burst_limit,
    });
    setIsEditOpen(true);
  };

  const getAppliesToBadge = (appliesTo: AppliesTo) => {
    switch (appliesTo) {
      case 'all':
        return <Badge variant="outline">All Users</Badge>;
      case 'authenticated':
        return <Badge variant="secondary">Authenticated</Badge>;
      case 'anonymous':
        return <Badge variant="secondary">Anonymous</Badge>;
      case 'specific_orgs':
        return <Badge>Specific Orgs</Badge>;
      default:
        return <Badge variant="outline">{appliesTo}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Limits</h1>
          <p className="text-muted-foreground">
            Configure API rate limiting rules to protect against abuse
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Rules</CardTitle>
          <CardDescription>{rules.length} rules configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Endpoint Pattern</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{rule.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs">
                      {rule.endpoint_pattern}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{rule.requests_per_minute}/min</div>
                      {rule.requests_per_hour && (
                        <div className="text-muted-foreground">{rule.requests_per_hour}/hr</div>
                      )}
                      {rule.burst_limit && (
                        <div className="text-muted-foreground">burst: {rule.burst_limit}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getAppliesToBadge(rule.applies_to)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggle(rule)}
                        aria-label={`Toggle ${rule.name}`}
                      />
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(rule.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(rule)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Limits
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedRule(rule);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {rules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No rate limit rules configured. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Rate Limit Rule</DialogTitle>
            <DialogDescription>
              Add a new rate limiting rule to protect API endpoints.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                placeholder="e.g., Ticket Purchase Limit"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint Pattern</Label>
              <Input
                id="endpoint"
                placeholder="e.g., /api/v1/*/tickets/purchase"
                value={newRule.endpoint_pattern}
                onChange={(e) => setNewRule({ ...newRule, endpoint_pattern: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Use * as wildcard. Example: /api/v1/*/orders/*
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rpm">Requests/Minute</Label>
                <Input
                  id="rpm"
                  type="number"
                  min={1}
                  max={10000}
                  value={newRule.requests_per_minute}
                  onChange={(e) =>
                    setNewRule({ ...newRule, requests_per_minute: parseInt(e.target.value) || 60 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rph">Requests/Hour (optional)</Label>
                <Input
                  id="rph"
                  type="number"
                  min={1}
                  max={100000}
                  placeholder="None"
                  value={newRule.requests_per_hour || ''}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      requests_per_hour: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="burst">Burst Limit (optional)</Label>
                <Input
                  id="burst"
                  type="number"
                  min={1}
                  max={1000}
                  placeholder="None"
                  value={newRule.burst_limit || ''}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      burst_limit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applies_to">Applies To</Label>
                <Select
                  value={newRule.applies_to}
                  onValueChange={(value: AppliesTo) => setNewRule({ ...newRule, applies_to: value })}
                >
                  <SelectTrigger id="applies_to">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="authenticated">Authenticated Only</SelectItem>
                    <SelectItem value="anonymous">Anonymous Only</SelectItem>
                    <SelectItem value="specific_orgs">Specific Orgs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newRule.name.trim() || !newRule.endpoint_pattern.trim()}
            >
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rate Limits</DialogTitle>
            <DialogDescription>
              Adjust the rate limits for &quot;{selectedRule?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Endpoint Pattern</Label>
              <code className="block rounded bg-muted px-3 py-2 text-sm">
                {selectedRule?.endpoint_pattern}
              </code>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rpm">Requests/Minute</Label>
                <Input
                  id="edit-rpm"
                  type="number"
                  min={1}
                  max={10000}
                  value={editForm.requests_per_minute}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      requests_per_minute: parseInt(e.target.value) || 60,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rph">Requests/Hour</Label>
                <Input
                  id="edit-rph"
                  type="number"
                  min={1}
                  max={100000}
                  placeholder="None"
                  value={editForm.requests_per_hour || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      requests_per_hour: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-burst">Burst Limit</Label>
              <Input
                id="edit-burst"
                type="number"
                min={1}
                max={1000}
                placeholder="None"
                value={editForm.burst_limit || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    burst_limit: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rate Limit Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the rule &quot;{selectedRule?.name}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
