'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Flag,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  getFeatureFlag,
  updateFeatureFlag,
  type FeatureFlagDetail,
} from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FeatureFlagDetailPage() {
  const params = useParams<{ flagId: string }>();
  const router = useRouter();
  const flagId = params.flagId;

  const [flag, setFlag] = useState<FeatureFlagDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [rolloutPercentage, setRolloutPercentage] = useState<number | null>(null);
  const [useRollout, setUseRollout] = useState(false);

  const fetchFlag = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getFeatureFlag(flagId);

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setFlag(result.data);
      setName(result.data.name);
      setDescription(result.data.description || '');
      setEnabled(result.data.enabled);
      setRolloutPercentage(result.data.rollout_percentage);
      setUseRollout(result.data.rollout_percentage !== null);
    }
    setIsLoading(false);
  }, [flagId]);

  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  const handleSave = async () => {
    if (!flag) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const updateData: {
      name: string;
      description?: string;
      enabled: boolean;
      rollout_percentage: number | null;
    } = {
      name: name.trim(),
      enabled,
      rollout_percentage: useRollout ? rolloutPercentage : null,
    };
    if (description.trim()) {
      updateData.description = description.trim();
    }
    const result = await updateFeatureFlag(flagId, updateData);

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setFlag(result.data);
      setSuccess('Feature flag updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    }

    setIsSaving(false);
  };

  const handleToggleEnabled = async (newEnabled: boolean) => {
    setEnabled(newEnabled);
    setIsSaving(true);
    setError(null);

    const result = await updateFeatureFlag(flagId, { enabled: newEnabled });

    if (result.error) {
      setError(result.error.message);
      setEnabled(!newEnabled); // Revert
    } else if (result.data) {
      setFlag(result.data);
      setSuccess(`Flag ${newEnabled ? 'enabled' : 'disabled'}`);
      setTimeout(() => setSuccess(null), 3000);
    }

    setIsSaving(false);
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

  if (!flag) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/feature-flags">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feature Flags
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature flag not found</AlertTitle>
          <AlertDescription>{error || 'The feature flag could not be found.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasChanges =
    name !== flag.name ||
    description !== (flag.description || '') ||
    enabled !== flag.enabled ||
    (useRollout ? rolloutPercentage : null) !== flag.rollout_percentage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/feature-flags">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Flag className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-2xl font-bold">{flag.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">{flag.key}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={handleToggleEnabled}
            disabled={isSaving}
            aria-label="Toggle flag"
          />
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? 'Enabled Globally' : 'Disabled'}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Info about per-org targeting */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Per-Organization Features</AlertTitle>
        <AlertDescription>
          To enable this feature for specific organizations, go to{' '}
          <Link href="/admin/organizations" className="underline font-medium">
            Organizations
          </Link>{' '}
          and manage features from each organization&apos;s detail page.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the flag name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Feature flag name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this flag controls..."
                rows={3}
              />
            </div>
            <div className="pt-4 border-t text-sm text-muted-foreground">
              <p>Created: {formatDate(flag.created_at)}</p>
              <p>Updated: {formatDate(flag.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rollout Percentage */}
        <Card>
          <CardHeader>
            <CardTitle>Rollout Percentage</CardTitle>
            <CardDescription>
              Gradually roll out to a percentage of users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!useRollout}
                  onChange={() => setUseRollout(false)}
                  className="h-4 w-4"
                />
                <span>All users (when enabled)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={useRollout}
                  onChange={() => setUseRollout(true)}
                  className="h-4 w-4"
                />
                <span>Percentage rollout</span>
              </label>
            </div>

            {useRollout && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rollout Percentage</span>
                  <span className="text-2xl font-bold">{rolloutPercentage ?? 0}%</span>
                </div>
                <Slider
                  value={[rolloutPercentage ?? 0]}
                  onValueChange={(values: number[]) => setRolloutPercentage(values[0] ?? 0)}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  {rolloutPercentage ?? 0}% of users will see this feature when enabled
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Current targeting configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{flag.org_ids?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Organizations with this feature enabled</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{flag.user_ids?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Users with this feature enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata (Read-only) */}
      {flag.metadata && Object.keys(flag.metadata).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>Additional configuration (read-only)</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(flag.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/feature-flags')}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
