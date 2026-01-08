'use client';

import { Bell, Clock, Loader2, Pause, Play, Save, Settings2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { QueueConfig } from '@/lib/api/types';

interface QueueSettingsFormProps {
  orgId: string;
  attractionId: string;
  attractionName: string;
  initialConfig: QueueConfig | null;
}

interface FormData {
  name: string;
  isActive: boolean;
  isPaused: boolean;
  capacityPerBatch: number;
  batchIntervalMinutes: number;
  maxWaitMinutes: number;
  maxQueueSize: number;
  allowRejoin: boolean;
  requireCheckIn: boolean;
  notificationLeadMinutes: number;
  expiryMinutes: number;
}

export function QueueSettingsForm({
  orgId,
  attractionId,
  attractionName,
  initialConfig,
}: QueueSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: initialConfig?.name ?? `${attractionName} Queue`,
    isActive: initialConfig?.is_active ?? false,
    isPaused: initialConfig?.is_paused ?? false,
    capacityPerBatch: initialConfig?.capacity_per_batch ?? 10,
    batchIntervalMinutes: initialConfig?.batch_interval_minutes ?? 15,
    maxWaitMinutes: initialConfig?.max_wait_minutes ?? 120,
    maxQueueSize: initialConfig?.max_queue_size ?? 500,
    allowRejoin: initialConfig?.allow_rejoin ?? false,
    requireCheckIn: initialConfig?.require_check_in ?? true,
    notificationLeadMinutes: initialConfig?.notification_lead_minutes ?? 10,
    expiryMinutes: initialConfig?.expiry_minutes ?? 15,
  });

  const hasConfig = !!initialConfig;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const endpoint = `/api/queue/${orgId}/${attractionId}/config`;
      const method = hasConfig ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save settings');
      }

      toast({
        title: 'Settings saved',
        description: 'Queue settings have been updated successfully.',
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!hasConfig) {
      // Need to create config first
      await handleSave();
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/queue/${orgId}/${attractionId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !formData.isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle queue status');
      }

      setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
      toast({
        title: formData.isActive ? 'Queue disabled' : 'Queue enabled',
        description: formData.isActive
          ? 'The virtual queue has been disabled.'
          : 'The virtual queue is now accepting guests.',
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle queue',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePause = async () => {
    if (!hasConfig) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/queue/${orgId}/${attractionId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused: !formData.isPaused }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle pause status');
      }

      setFormData((prev) => ({ ...prev, isPaused: !prev.isPaused }));
      toast({
        title: formData.isPaused ? 'Queue resumed' : 'Queue paused',
        description: formData.isPaused
          ? 'The queue is now accepting new entries.'
          : 'The queue is paused. Existing entries are preserved.',
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle pause',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = isSaving || isPending;

  return (
    <>
      {/* Queue Status Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Queue Status
          </CardTitle>
          <CardDescription>Control whether guests can join the queue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-active">Enable Virtual Queue</Label>
              <p className="text-sm text-muted-foreground">
                Allow guests to join the virtual queue for this attraction.
              </p>
            </div>
            <Switch
              id="is-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
              disabled={isLoading}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-paused">Pause Queue</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily stop accepting new guests while preserving existing entries.
              </p>
            </div>
            <Switch
              id="is-paused"
              checked={formData.isPaused}
              onCheckedChange={(checked) => updateField('isPaused', checked)}
              disabled={isLoading || !formData.isActive}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={formData.isActive ? 'outline' : 'default'}
              onClick={handleToggleActive}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : formData.isActive ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {formData.isActive ? 'Disable Queue' : 'Enable Queue'}
            </Button>
            {formData.isActive && (
              <Button variant="outline" onClick={handleTogglePause} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : formData.isPaused ? (
                  <Play className="mr-2 h-4 w-4" />
                ) : (
                  <Pause className="mr-2 h-4 w-4" />
                )}
                {formData.isPaused ? 'Resume Queue' : 'Pause Queue'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Capacity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity Settings
          </CardTitle>
          <CardDescription>Configure how many guests can be processed at once.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="capacity-per-batch">Guests Per Batch</Label>
              <Input
                id="capacity-per-batch"
                type="number"
                min={1}
                max={100}
                value={formData.capacityPerBatch}
                onChange={(e) => updateField('capacityPerBatch', parseInt(e.target.value, 10) || 1)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Number of guests to call in each batch.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch-interval">Batch Interval (minutes)</Label>
              <Input
                id="batch-interval"
                type="number"
                min={1}
                max={60}
                value={formData.batchIntervalMinutes}
                onChange={(e) =>
                  updateField('batchIntervalMinutes', parseInt(e.target.value, 10) || 1)
                }
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Time between calling batches.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-queue-size">Maximum Queue Size</Label>
              <Input
                id="max-queue-size"
                type="number"
                min={1}
                max={10000}
                value={formData.maxQueueSize}
                onChange={(e) => updateField('maxQueueSize', parseInt(e.target.value, 10) || 1)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of parties that can be in the queue.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-wait">Maximum Wait Time (minutes)</Label>
              <Input
                id="max-wait"
                type="number"
                min={15}
                max={480}
                value={formData.maxWaitMinutes}
                onChange={(e) => updateField('maxWaitMinutes', parseInt(e.target.value, 10) || 15)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Entries are marked expired after this time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure how and when guests are notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notification-lead">Notification Lead Time (minutes)</Label>
              <Input
                id="notification-lead"
                type="number"
                min={1}
                max={60}
                value={formData.notificationLeadMinutes}
                onChange={(e) =>
                  updateField('notificationLeadMinutes', parseInt(e.target.value, 10) || 1)
                }
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                How early to notify guests before their turn.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry-minutes">Expiry Time (minutes)</Label>
              <Input
                id="expiry-minutes"
                type="number"
                min={1}
                max={60}
                value={formData.expiryMinutes}
                onChange={(e) => updateField('expiryMinutes', parseInt(e.target.value, 10) || 1)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                How long guests have to check in after being called.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Guest Options
          </CardTitle>
          <CardDescription>Configure guest experience and requirements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-checkin">Require Check-In</Label>
              <p className="text-sm text-muted-foreground">
                Guests must check in at the entrance when called.
              </p>
            </div>
            <Switch
              id="require-checkin"
              checked={formData.requireCheckIn}
              onCheckedChange={(checked) => updateField('requireCheckIn', checked)}
              disabled={isLoading}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-rejoin">Allow Rejoin</Label>
              <p className="text-sm text-muted-foreground">
                Allow guests to rejoin the queue if their entry expires.
              </p>
            </div>
            <Switch
              id="allow-rejoin"
              checked={formData.allowRejoin}
              onCheckedChange={(checked) => updateField('allowRejoin', checked)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </>
  );
}
