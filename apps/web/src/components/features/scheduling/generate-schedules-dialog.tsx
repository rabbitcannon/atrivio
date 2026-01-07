'use client';

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { generateSchedulesFromTemplates, type ShiftTemplate } from '@/lib/api/client';

interface GenerateSchedulesDialogProps {
  orgId: string;
  attractionId: string;
  templates: ShiftTemplate[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GenerateSchedulesDialog({
  orgId,
  attractionId,
  templates,
  open,
  onOpenChange,
}: GenerateSchedulesDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ count: number } | null>(null);

  // Calculate default date range (next week)
  const getDefaultDates = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);

    return {
      startDate: nextMonday.toISOString().split('T')[0]!,
      endDate: nextSunday.toISOString().split('T')[0]!,
    };
  };

  const defaultDates = getDefaultDates();

  const [formData, setFormData] = useState({
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    asDraft: true,
    selectedTemplates: templates.map((t) => t.id),
  });

  const handleTemplateToggle = (templateId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.includes(templateId)
        ? prev.selectedTemplates.filter((id) => id !== templateId)
        : [...prev.selectedTemplates, templateId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload: {
      startDate: string;
      endDate: string;
      asDraft?: boolean;
      templateIds?: string[];
    } = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      asDraft: formData.asDraft,
    };

    // Only include templateIds if not selecting all
    if (formData.selectedTemplates.length !== templates.length) {
      payload.templateIds = formData.selectedTemplates;
    }

    const { data, error: apiError } = await generateSchedulesFromTemplates(
      orgId,
      attractionId,
      payload
    );

    if (apiError) {
      setError(apiError.message || 'Failed to generate schedules');
      setLoading(false);
      return;
    }

    setSuccess({ count: data?.createdCount || 0 });
    setLoading(false);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Generate Schedules</DialogTitle>
            <DialogDescription>
              Create shifts from templates for a date range. Staff can be assigned after generation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Successfully created {success.count} shifts! View them in the Shifts tab.
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="asDraft"
                    checked={formData.asDraft}
                    onCheckedChange={(checked: boolean | 'indeterminate') =>
                      setFormData({ ...formData, asDraft: checked === true })
                    }
                  />
                  <Label htmlFor="asDraft" className="text-sm font-normal">
                    Create as draft (review before publishing)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Templates to Use</Label>
                  <div className="rounded-lg border p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={template.id}
                          checked={formData.selectedTemplates.includes(template.id)}
                          onCheckedChange={() => handleTemplateToggle(template.id)}
                        />
                        <Label htmlFor={template.id} className="text-sm font-normal flex-1">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-muted-foreground ml-2">
                            ({template.staff_count} staff)
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.selectedTemplates.length} of {templates.length} templates selected
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {success ? (
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || formData.selectedTemplates.length === 0}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Schedules
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
