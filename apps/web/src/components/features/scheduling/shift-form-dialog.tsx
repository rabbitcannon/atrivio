'use client';

import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  createSchedule,
  getScheduleRoles,
  getStaff,
  type Schedule,
  type ScheduleRole,
  type ScheduleStatus,
  type StaffListItem,
  updateSchedule,
} from '@/lib/api/client';

interface ShiftFormDialogProps {
  orgId: string;
  attractionId: string;
  schedule?: Schedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const STATUS_OPTIONS: { value: ScheduleStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'canceled', label: 'Canceled' },
];

export function ShiftFormDialog({
  orgId,
  attractionId,
  schedule,
  open,
  onOpenChange,
  onSaved,
}: ShiftFormDialogProps) {
  const [roles, setRoles] = useState<ScheduleRole[]>([]);
  const [staff, setStaff] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    shiftDate: '',
    startTime: '',
    endTime: '',
    roleId: '',
    staffId: '',
    status: 'scheduled' as ScheduleStatus,
    notes: '',
  });

  // Load roles and staff when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadData() {
      const [rolesRes, staffRes] = await Promise.all([getScheduleRoles(orgId), getStaff(orgId)]);

      if (rolesRes.data) {
        setRoles(rolesRes.data);
      }
      if (staffRes.data) {
        setStaff(staffRes.data.data);
      }
    }

    loadData();
  }, [open, orgId]);

  // Reset form when schedule changes
  useEffect(() => {
    if (schedule) {
      setFormData({
        shiftDate: schedule.date,
        startTime: schedule.start_time.slice(0, 5), // HH:MM
        endTime: schedule.end_time.slice(0, 5),
        roleId: schedule.role_id,
        staffId: schedule.staff_id || '',
        status: schedule.status,
        notes: schedule.notes || '',
      });
    } else {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        shiftDate: today!,
        startTime: '18:00',
        endTime: '23:00',
        roleId: roles.length > 0 ? roles[0]?.id : '',
        staffId: '',
        status: 'scheduled',
        notes: '',
      });
    }
  }, [schedule, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (schedule) {
      // Update existing - build payload conditionally to avoid undefined values
      const updatePayload: {
        staffId?: string;
        roleId?: string;
        shiftDate?: string;
        startTime?: string;
        endTime?: string;
        status?: ScheduleStatus;
        notes?: string;
      } = {
        shiftDate: formData.shiftDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        roleId: formData.roleId,
        status: formData.status,
      };
      if (formData.staffId) updatePayload.staffId = formData.staffId;
      if (formData.notes) updatePayload.notes = formData.notes;

      const { error: apiError } = await updateSchedule(orgId, schedule.id, updatePayload);
      if (apiError) {
        setError(apiError.message || 'Failed to update shift');
        setLoading(false);
        return;
      }
    } else {
      // Create new - build payload conditionally
      const createPayload: {
        roleId: string;
        shiftDate: string;
        startTime: string;
        endTime: string;
        staffId?: string;
        notes?: string;
      } = {
        shiftDate: formData.shiftDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        roleId: formData.roleId,
      };
      if (formData.staffId) createPayload.staffId = formData.staffId;
      if (formData.notes) createPayload.notes = formData.notes;

      const { error: apiError } = await createSchedule(orgId, attractionId, createPayload);
      if (apiError) {
        setError(apiError.message || 'Failed to create shift');
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
            <DialogTitle>{schedule ? 'Edit Shift' : 'Create Shift'}</DialogTitle>
            <DialogDescription>
              {schedule ? 'Update the shift details below.' : 'Add a new shift to the schedule.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftDate">Date</Label>
                <Input
                  id="shiftDate"
                  type="date"
                  value={formData.shiftDate}
                  onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as ScheduleStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Label htmlFor="staffId">Assign to Staff (Optional)</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {staff.map((member) => {
                    const name =
                      [member.user.first_name, member.user.last_name].filter(Boolean).join(' ') ||
                      member.user.email;
                    return (
                      <SelectItem key={member.id} value={member.id}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes for this shift..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.roleId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {schedule ? 'Save Changes' : 'Create Shift'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
