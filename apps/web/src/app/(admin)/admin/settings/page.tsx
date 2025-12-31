'use client';

import { useEffect, useState } from 'react';
import { Save, AlertCircle, Settings, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSettings, updateSetting, type PlatformSetting } from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCategoryBadgeVariant(
  category: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (category) {
    case 'security':
      return 'destructive';
    case 'billing':
      return 'default';
    case 'email':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<PlatformSetting | null>(null);
  const [editValue, setEditValue] = useState<string>('');

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

  const handleEditClick = (setting: PlatformSetting) => {
    setSelectedSetting(setting);
    setEditValue(JSON.stringify(setting.value, null, 2));
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSetting) return;

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(editValue);
    } catch {
      setError('Invalid JSON value');
      return;
    }

    const result = await updateSetting(selectedSetting.key, { value: parsedValue });

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(`Setting "${selectedSetting.key}" updated successfully`);
      fetchSettings();
      setIsEditOpen(false);
      setSelectedSetting(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleReset = async () => {
    if (!selectedSetting) return;

    const result = await updateSetting(selectedSetting.key, { value: selectedSetting.default_value });

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccess(`Setting "${selectedSetting.key}" reset to default`);
      fetchSettings();
      setIsEditOpen(false);
      setSelectedSetting(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Group settings by category
  const settingsByCategory = settings.reduce(
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings and defaults</p>
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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {Object.entries(settingsByCategory).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="capitalize">{category} Settings</CardTitle>
            </div>
            <CardDescription>{categorySettings.length} settings in this category</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorySettings.map((setting) => (
                  <TableRow key={setting.key}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{setting.key}</p>
                        {setting.description && (
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="max-w-[200px] truncate rounded bg-muted px-2 py-1 text-sm">
                        {typeof setting.value === 'object'
                          ? JSON.stringify(setting.value)
                          : String(setting.value)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{setting.value_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(setting.updated_at)}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(setting)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {settings.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No settings configured. Settings will appear here once created.
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Modify the value for <code className="font-mono">{selectedSetting?.key}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSetting?.description && (
              <p className="text-sm text-muted-foreground">{selectedSetting.description}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="value">Value (JSON)</Label>
              <Textarea
                id="value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[120px] font-mono"
                placeholder="Enter JSON value..."
              />
              <p className="text-xs text-muted-foreground">
                Type: <code>{selectedSetting?.value_type}</code>
              </p>
            </div>
            {selectedSetting?.default_value !== undefined && (
              <div className="space-y-2">
                <Label>Default Value</Label>
                <code className="block rounded bg-muted p-2 text-sm">
                  {JSON.stringify(selectedSetting.default_value)}
                </code>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleReset} className="mr-auto">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
