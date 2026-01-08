'use client';

import {
  AlertTriangle,
  Check,
  Clock,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  Server,
  Shield,
  Sliders,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { getSettings, type PlatformSetting, updateSetting } from '@/lib/api/admin';
import { cn } from '@/lib/utils/cn';

// Category metadata
const categoryConfig: Record<
  string,
  { icon: React.ElementType; label: string; description: string }
> = {
  system: {
    icon: Server,
    label: 'System',
    description: 'Core platform configuration',
  },
  security: {
    icon: Shield,
    label: 'Security',
    description: 'Security and access controls',
  },
  limits: {
    icon: Sliders,
    label: 'Limits',
    description: 'Platform usage limits',
  },
  billing: {
    icon: CreditCard,
    label: 'Billing',
    description: 'Payment and subscription settings',
  },
  general: {
    icon: Globe,
    label: 'General',
    description: 'General platform settings',
  },
};

// Human-readable setting names
const settingLabels: Record<string, { label: string; description?: string }> = {
  maintenance_mode: { label: 'Maintenance Mode' },
  registration_enabled: {
    label: 'User Registration',
    description: 'Allow new users to sign up',
  },
  max_orgs_per_user: {
    label: 'Max Organizations per User',
    description: 'Maximum number of organizations a single user can create',
  },
  default_trial_days: {
    label: 'Default Trial Period',
    description: 'Number of days for new organization trials',
  },
  stripe_platform_fee_percent: {
    label: 'Platform Fee',
    description: 'Percentage fee charged on all transactions',
  },
  support_email: {
    label: 'Support Email',
    description: 'Email address for platform support',
  },
  terms_version: {
    label: 'Terms of Service Version',
    description: 'Current version of the terms of service',
  },
  privacy_version: {
    label: 'Privacy Policy Version',
    description: 'Current version of the privacy policy',
  },
  max_attractions_per_org: {
    label: 'Max Attractions per Org',
    description: 'Maximum attractions an organization can create',
  },
  default_timezone: {
    label: 'Default Timezone',
    description: 'Default timezone for new organizations',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Individual setting row component with inline editing
function SettingRow({
  setting,
  onUpdate,
}: {
  setting: PlatformSetting;
  onUpdate: (key: string, value: unknown) => Promise<void>;
}) {
  const [localValue, setLocalValue] = useState<string | number | boolean>(
    typeof setting.value === 'object'
      ? JSON.stringify(setting.value)
      : (setting.value as string | number | boolean)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const meta = settingLabels[setting.key] || { label: setting.key };
  const isModified =
    setting.default_value !== undefined &&
    JSON.stringify(setting.value) !== JSON.stringify(setting.default_value);

  useEffect(() => {
    const currentVal =
      typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value;
    setHasChanges(localValue !== currentVal);
  }, [localValue, setting.value]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let valueToSave: unknown = localValue;
      if (setting.value_type === 'number') {
        valueToSave = Number(localValue);
      } else if (setting.value_type === 'boolean') {
        valueToSave = localValue;
      } else if (setting.value_type === 'object') {
        valueToSave = JSON.parse(localValue as string);
      }
      await onUpdate(setting.key, valueToSave);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setLocalValue(checked);
    setIsSaving(true);
    try {
      await onUpdate(setting.key, checked);
    } finally {
      setIsSaving(false);
    }
  };

  // Boolean toggle
  if (setting.value_type === 'boolean') {
    return (
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">{meta.label}</Label>
            {isModified && (
              <Badge variant="secondary" className="text-xs">
                Modified
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{meta.description || setting.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Switch
            checked={localValue as boolean}
            onCheckedChange={handleToggle}
            disabled={isSaving}
          />
        </div>
      </div>
    );
  }

  // Number input
  if (setting.value_type === 'number') {
    const isPercentage = setting.key.includes('percent') || setting.key.includes('fee');
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">{meta.label}</Label>
              {isModified && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {meta.description || setting.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Input
                type="number"
                value={localValue as number}
                onChange={(e) => setLocalValue(Number(e.target.value))}
                className={cn('w-24 pr-8', isPercentage && 'pr-10')}
                min={0}
                step={isPercentage ? 0.1 : 1}
              />
              {isPercentage && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              )}
            </div>
            {hasChanges && (
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          <Clock className="mr-1 inline h-3 w-3" />
          Updated {formatDate(setting.updated_at)}
        </p>
      </div>
    );
  }

  // String input
  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Label className="text-base font-medium">{meta.label}</Label>
              {isModified && (
                <Badge variant="secondary" className="text-xs">
                  Modified
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {meta.description || setting.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={localValue as string}
            onChange={(e) => setLocalValue(e.target.value)}
            className="flex-1"
          />
          {hasChanges && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          <Clock className="mr-1 inline h-3 w-3" />
          Updated {formatDate(setting.updated_at)}
        </p>
      </div>
    </div>
  );
}

// Maintenance Mode Card - Special treatment
function MaintenanceModeCard({
  setting,
  onUpdate,
}: {
  setting: PlatformSetting;
  onUpdate: (key: string, value: unknown) => Promise<void>;
}) {
  const value = setting.value as {
    enabled: boolean;
    message: string | null;
    allow_admins: boolean;
  };
  const [enabled, setEnabled] = useState(value.enabled);
  const [message, setMessage] = useState(value.message || '');
  const [allowAdmins, setAllowAdmins] = useState(value.allow_admins);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      enabled !== value.enabled ||
      message !== (value.message || '') ||
      allowAdmins !== value.allow_admins;
    setHasChanges(changed);
  }, [enabled, message, allowAdmins, value]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(setting.key, {
        enabled,
        message: message || null,
        allow_admins: allowAdmins,
      });
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    setIsSaving(true);
    try {
      await onUpdate(setting.key, {
        enabled: checked,
        message: message || null,
        allow_admins: allowAdmins,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={cn(enabled && 'border-destructive bg-destructive/5')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                enabled ? 'bg-destructive/10 text-destructive' : 'bg-muted'
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Maintenance Mode
                {enabled && (
                  <Badge variant="destructive" className="ml-2">
                    Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                When enabled, users will see a maintenance message and cannot access the platform
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isSaving} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="maintenance-message">Maintenance Message</Label>
          <Textarea
            id="maintenance-message"
            placeholder="We're currently performing scheduled maintenance. Please check back soon."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch id="allow-admins" checked={allowAdmins} onCheckedChange={setAllowAdmins} />
            <Label htmlFor="allow-admins" className="cursor-pointer">
              <Lock className="mr-1 inline h-4 w-4" />
              Allow admins to bypass maintenance
            </Label>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchSettings() {
    setIsLoading(true);
    const result = await getSettings();

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setSettings(result.data.settings);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string, value: unknown) => {
    setError(null);
    const result = await updateSetting(key, { value });

    if (result.error) {
      setError(result.error.message);
      throw new Error(result.error.message);
    } else {
      setSuccess(`Setting updated successfully`);
      // Refresh to get updated data
      await fetchSettings();
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  // Find maintenance mode setting
  const maintenanceSetting = settings.find((s) => s.key === 'maintenance_mode');

  // Group other settings by category (excluding maintenance_mode)
  const settingsByCategory = settings
    .filter((s) => s.key !== 'maintenance_mode')
    .reduce(
      (acc, setting) => {
        const category = setting.category || 'general';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(setting);
        return acc;
      },
      {} as Record<string, PlatformSetting[]>
    );

  // Sort categories
  const categoryOrder = ['security', 'limits', 'billing', 'general'];
  const sortedCategories = Object.entries(settingsByCategory).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings and defaults</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-500/10 text-green-600">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Maintenance Mode - Featured at top */}
      {maintenanceSetting && (
        <MaintenanceModeCard setting={maintenanceSetting} onUpdate={handleUpdate} />
      )}

      {/* Settings by Category */}
      <div className="grid gap-6 lg:grid-cols-2">
        {sortedCategories.map(([category, categorySettings]) => {
          const config = categoryConfig[category] || categoryConfig.general;
          const Icon = config.icon;

          return (
            <Card key={category} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle>{config.label}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {categorySettings.map((setting) => (
                  <SettingRow key={setting.key} setting={setting} onUpdate={handleUpdate} />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {settings.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No settings configured</h3>
            <p className="mt-2 text-muted-foreground">Settings will appear here once created.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
