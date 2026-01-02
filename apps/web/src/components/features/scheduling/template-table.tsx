'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Copy,
  Play,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getShiftTemplates,
  getAttractions,
  deleteShiftTemplate,
  type ShiftTemplate,
  type AttractionListItem,
} from '@/lib/api/client';
import { TemplateFormDialog } from './template-form-dialog';
import { GenerateSchedulesDialog } from './generate-schedules-dialog';

interface TemplateTableProps {
  orgId: string;
  orgSlug: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function TemplateTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Staff Needed</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-8" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours!, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function TemplateTable({ orgId, orgSlug }: TemplateTableProps) {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Load attractions on mount
  useEffect(() => {
    async function fetchAttractions() {
      const { data, error: apiError } = await getAttractions(orgId);
      if (data?.data) {
        setAttractions(data.data);
        if (data.data.length > 0 && !selectedAttraction) {
          setSelectedAttraction(data.data[0]!.id);
        }
      }
      if (apiError) {
        setError(apiError.message || 'Failed to load attractions');
      }
    }
    fetchAttractions();
  }, [orgId, selectedAttraction]);

  // Load templates when attraction changes
  useEffect(() => {
    if (!selectedAttraction) return;

    async function fetchTemplates() {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getShiftTemplates(orgId, selectedAttraction);

      if (apiError) {
        setError(apiError.message || 'Failed to load templates');
      } else if (data) {
        setTemplates(data);
      }

      setLoading(false);
    }

    fetchTemplates();
  }, [orgId, selectedAttraction]);

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const { error: deleteError } = await deleteShiftTemplate(orgId, templateId);
    if (deleteError) {
      setError(deleteError.message || 'Failed to delete template');
    } else {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    }
  };

  const handleSaved = () => {
    // Refresh the list
    if (selectedAttraction) {
      getShiftTemplates(orgId, selectedAttraction).then(({ data }) => {
        if (data) setTemplates(data);
      });
    }
    setShowCreateDialog(false);
    setEditingTemplate(null);
  };

  if (attractions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No attractions found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an attraction first before managing templates.
        </p>
        <Button asChild className="mt-4">
          <a href={`/${orgSlug}/attractions/new`}>Create Attraction</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={selectedAttraction} onValueChange={setSelectedAttraction}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select attraction" />
          </SelectTrigger>
          <SelectContent>
            {attractions.map((attraction) => (
              <SelectItem key={attraction.id} value={attraction.id}>
                {attraction.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          {templates.length > 0 && (
            <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
              <Play className="mr-2 h-4 w-4" />
              Generate Schedules
            </Button>
          )}
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <TemplateTableSkeleton />
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <Copy className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No templates yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create shift templates to quickly generate schedules for each week.
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Staff Needed</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{DAY_NAMES[template.day_of_week]}</TableCell>
                  <TableCell>
                    {formatTime(template.start_time)} - {formatTime(template.end_time)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: template.role.color,
                        color: template.role.color,
                      }}
                    >
                      {template.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>{template.staff_count}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTemplate(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <TemplateFormDialog
        orgId={orgId}
        attractionId={selectedAttraction}
        template={editingTemplate}
        open={showCreateDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTemplate(null);
          }
        }}
        onSaved={handleSaved}
      />

      {/* Generate Schedules Dialog */}
      <GenerateSchedulesDialog
        orgId={orgId}
        attractionId={selectedAttraction}
        templates={templates}
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
      />
    </div>
  );
}
