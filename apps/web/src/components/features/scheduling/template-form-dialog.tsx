'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  createShiftTemplate,
  updateShiftTemplate,
  getScheduleRoles,
  type ShiftTemplate,
  type ScheduleRole,
} from '@/lib/api/client';

interface TemplateFormDialogProps {
  orgId: string;
  attractionId: string;
  template?: ShiftTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export function TemplateFormDialog({
  orgId,
  attractionId,
  template,
  open,
  onOpenChange,
  onSaved,
}: TemplateFormDialogProps) {
  const [roles, setRoles] = useState<ScheduleRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dayOfWeek: '5', // Default to Friday
    startTime: '18:00',
    endTime: '23:00',
    roleId: '',
    staffCount: 1,
    notes: '',
  });

  // Load roles when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadRoles() {
      const { data } = await getScheduleRoles(orgId);
      if (data) {
        setRoles(data);
        if (data.length > 0 && !formData.roleId) {
          setFormData((prev) => ({ ...prev, roleId: data[0]!.id }));
        }
      }
    }

    loadRoles();
  }, [open, orgId, formData.roleId]);

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        dayOfWeek: template.day_of_week.toString(),
        startTime: template.start_time.slice(0, 5),
        endTime: template.end_time.slice(0, 5),
        roleId: template.role_id,
        staffCount: template.staff_count,
        notes: template.notes || '',
      });
    } else {
      setFormData({
        name: '',
        dayOfWeek: '5',
        startTime: '18:00',
        endTime: '23:00',
        roleId: roles.length > 0 ? roles[0]!.id : '',
        staffCount: 1,
        notes: '',
      });
    }
  }, [template, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (template) {
      // Update existing - build payload without notes if empty
      const updatePayload: {
        name?: string;
        roleId?: string;
        dayOfWeek?: number;
        startTime?: string;
        endTime?: string;
        staffCount?: number;
        notes?: string;
      } = {
        name: formData.name,
        dayOfWeek: parseInt(formData.dayOfWeek, 10),
        startTime: formData.startTime,
        endTime: formData.endTime,
        roleId: formData.roleId,
        staffCount: formData.staffCount,
      };
      if (formData.notes) updatePayload.notes = formData.notes;

      const { error: apiError } = await updateShiftTemplate(orgId, template.id, updatePayload);
      if (apiError) {
        setError(apiError.message || 'Failed to update template');
        setLoading(false);
        return;
      }
    } else {
      // Create new - build payload without notes if empty
      const createPayload: {
        name: string;
        roleId: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        staffCount?: number;
        notes?: string;
      } = {
        name: formData.name,
        dayOfWeek: parseInt(formData.dayOfWeek, 10),
        startTime: formData.startTime,
        endTime: formData.endTime,
        roleId: formData.roleId,
        staffCount: formData.staffCount,
      };
      if (formData.notes) createPayload.notes = formData.notes;

      const { error: apiError } = await createShiftTemplate(orgId, attractionId, createPayload);
      if (apiError) {
        setError(apiError.message || 'Failed to create template');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{template ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {template
                ? 'Update the shift template details.'
                : 'Create a reusable shift template for quick scheduling.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Friday Night Actor Shift"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OPTIONS.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="staffCount">Staff Needed</Label>
                <Input
                  id="staffCount"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.staffCount}
                  onChange={(e) =>
                    setFormData({ ...formData, staffCount: parseInt(e.target.value, 10) || 1 })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about this template..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.roleId || !formData.name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
