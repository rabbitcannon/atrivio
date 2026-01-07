'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Tag,
  Bell,
  ExternalLink,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';
import type { StorefrontAnnouncement, AnnouncementType } from '@/lib/api/types';

const TYPE_CONFIG: Record<
  AnnouncementType,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Info }
> = {
  info: { label: 'Info', variant: 'secondary', icon: Info },
  warning: { label: 'Warning', variant: 'outline', icon: AlertTriangle },
  critical: { label: 'Critical', variant: 'destructive', icon: Bell },
  success: { label: 'Success', variant: 'default', icon: CheckCircle },
  promo: { label: 'Promotion', variant: 'outline', icon: Tag },
};

interface FormData {
  title: string;
  content: string;
  type: AnnouncementType;
  linkUrl: string;
  linkText: string;
  startsAt: string;
  endsAt: string;
  isDismissible: boolean;
}

const defaultFormData: FormData = {
  title: '',
  content: '',
  type: 'info',
  linkUrl: '',
  linkText: '',
  startsAt: '',
  endsAt: '',
  isDismissible: true,
};

export default function StorefrontAnnouncementsPage() {
  const params = useParams();
  const orgIdentifier = params['orgId'] as string;
  const attractionId = params['attractionId'] as string;
  const { toast } = useToast();

  const [announcements, setAnnouncements] = useState<StorefrontAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<StorefrontAnnouncement | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<StorefrontAnnouncement | null>(null);

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  useEffect(() => {
    async function init() {
      const orgId = await resolveOrgId(orgIdentifier);
      if (orgId) {
        setResolvedOrgId(orgId);
        await loadAnnouncements(orgId);
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier, attractionId]);

  async function loadAnnouncements(orgId: string) {
    try {
      const response = await apiClient.get<{ announcements: StorefrontAnnouncement[] }>(
        `/organizations/${orgId}/attractions/${attractionId}/storefront/announcements`
      );
      setAnnouncements(response?.announcements || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive',
      });
    }
  }

  function isCurrentlyActive(announcement: StorefrontAnnouncement): boolean {
    if (!announcement.isActive) return false;
    const now = new Date();
    if (announcement.startsAt && new Date(announcement.startsAt) > now) return false;
    if (announcement.endsAt && new Date(announcement.endsAt) < now) return false;
    return true;
  }

  function openCreateDialog() {
    setEditingAnnouncement(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  }

  function openEditDialog(announcement: StorefrontAnnouncement) {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      linkUrl: announcement.linkUrl || '',
      linkText: announcement.linkText || '',
      startsAt: announcement.startsAt ? announcement.startsAt.split('T')[0] ?? '' : '',
      endsAt: announcement.endsAt ? announcement.endsAt.split('T')[0] ?? '' : '',
      isDismissible: announcement.isDismissible,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit() {
    if (!resolvedOrgId) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    const payload = {
      title: formData.title,
      content: formData.content,
      type: formData.type,
      link_url: formData.linkUrl || undefined,
      link_text: formData.linkText || undefined,
      starts_at: formData.startsAt || undefined,
      ends_at: formData.endsAt || undefined,
      is_dismissible: formData.isDismissible,
    };

    try {
      if (editingAnnouncement) {
        await apiClient.patch(
          `/organizations/${resolvedOrgId}/attractions/${attractionId}/storefront/announcements/${editingAnnouncement.id}`,
          payload
        );
        toast({ title: 'Announcement updated' });
      } else {
        await apiClient.post(
          `/organizations/${resolvedOrgId}/attractions/${attractionId}/storefront/announcements`,
          payload
        );
        toast({ title: 'Announcement created' });
      }
      setIsDialogOpen(false);
      await loadAnnouncements(resolvedOrgId);
    } catch (error) {
      console.error('Failed to save announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save announcement',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(announcement: StorefrontAnnouncement) {
    if (!resolvedOrgId) return;

    try {
      await apiClient.patch(
        `/organizations/${resolvedOrgId}/attractions/${attractionId}/storefront/announcements/${announcement.id}`,
        { is_active: !announcement.isActive }
      );
      toast({
        title: announcement.isActive ? 'Announcement deactivated' : 'Announcement activated',
      });
      await loadAnnouncements(resolvedOrgId);
    } catch (error) {
      console.error('Failed to toggle announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update announcement',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete() {
    if (!resolvedOrgId || !deleteTarget) return;

    try {
      await apiClient.delete(
        `/organizations/${resolvedOrgId}/attractions/${attractionId}/storefront/announcements/${deleteTarget.id}`
      );
      toast({ title: 'Announcement deleted' });
      setDeleteTarget(null);
      await loadAnnouncements(resolvedOrgId);
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  }

  const activeAnnouncements = announcements.filter((a) => a.isActive);
  const scheduledAnnouncements = announcements.filter(
    (a) => a.startsAt && new Date(a.startsAt) > new Date()
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`${basePath}/storefront`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Storefront
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create announcements and promotions for your storefront.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAnnouncements.length}</div>
            <p className="text-xs text-muted-foreground">Currently showing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledAnnouncements.length}</div>
            <p className="text-xs text-muted-foreground">Future announcements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}</div>
            <p className="text-xs text-muted-foreground">All announcements</p>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            All Announcements
          </CardTitle>
          <CardDescription>{announcements.length} total announcements</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No announcements yet</h3>
              <p className="text-muted-foreground mb-4">
                Create announcements to inform your visitors about news, promotions, or alerts.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const typeConfig = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.info;
                const TypeIcon = typeConfig.icon;
                const currentlyActive = isCurrentlyActive(announcement);

                return (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg border ${!currentlyActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium">{announcement.title}</h4>
                            <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                            {announcement.linkUrl && (
                              <Badge variant="outline">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Has Link
                              </Badge>
                            )}
                            {!announcement.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {announcement.startsAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Starts: {new Date(announcement.startsAt).toLocaleDateString()}
                              </span>
                            )}
                            {announcement.endsAt && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Ends: {new Date(announcement.endsAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(announcement)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(announcement)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(announcement)}>
                              {announcement.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(announcement)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? 'Update the announcement details below.'
                : 'Create a new announcement to display on your storefront.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title"
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as AnnouncementType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="promo">Promotion</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={formData.linkText}
                  onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                  placeholder="Learn more"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startsAt">Start Date</Label>
                <Input
                  id="startsAt"
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endsAt">End Date</Label>
                <Input
                  id="endsAt"
                  type="date"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dismissible">Allow Dismissal</Label>
                <p className="text-xs text-muted-foreground">
                  Let visitors close this announcement
                </p>
              </div>
              <Switch
                id="dismissible"
                checked={formData.isDismissible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDismissible: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
