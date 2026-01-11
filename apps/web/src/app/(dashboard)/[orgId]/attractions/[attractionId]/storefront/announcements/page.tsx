'use client';

import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Edit,
  ExternalLink,
  Info,
  Megaphone,
  MoreHorizontal,
  Plus,
  Power,
  PowerOff,
  Tag,
  Trash2,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';
import type { AnnouncementType, StorefrontAnnouncement } from '@/lib/api/types';

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

// Animation constants
const EASE = [0.4, 0, 0.2, 1] as const;

// Animation components
function AnimatedPageHeader({
  children,
  shouldReduceMotion,
}: {
  children: ReactNode;
  shouldReduceMotion: boolean;
}) {
  if (shouldReduceMotion) {
    return <div className="space-y-4">{children}</div>;
  }
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedStatsGrid({
  children,
  shouldReduceMotion,
}: {
  children: ReactNode;
  shouldReduceMotion: boolean;
}) {
  if (shouldReduceMotion) {
    return <div className="grid gap-4 md:grid-cols-3">{children}</div>;
  }
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.1 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedStatCard({
  children,
  shouldReduceMotion,
}: {
  children: ReactNode;
  shouldReduceMotion: boolean;
}) {
  if (shouldReduceMotion) {
    return <>{children}</>;
  }
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCard({
  children,
  shouldReduceMotion,
  delay = 0.15,
}: {
  children: ReactNode;
  shouldReduceMotion: boolean;
  delay?: number;
}) {
  if (shouldReduceMotion) {
    return <>{children}</>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedAnnouncementRow({
  children,
  shouldReduceMotion,
  index,
}: {
  children: ReactNode;
  shouldReduceMotion: boolean;
  index: number;
}) {
  if (shouldReduceMotion) {
    return <>{children}</>;
  }
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: 0.2 + index * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedEmptyState({
  children,
  shouldReduceMotion,
}: {
  children: ReactNode;
  shouldReduceMotion: boolean;
}) {
  if (shouldReduceMotion) {
    return <div className="text-center py-12">{children}</div>;
  }
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

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
  const shouldReduceMotion = useReducedMotion() ?? false;

  const [announcements, setAnnouncements] = useState<StorefrontAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);
  const [attractionName, setAttractionName] = useState('');

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<StorefrontAnnouncement | null>(
    null
  );
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
        // Load attraction name for breadcrumbs
        try {
          const attractionData = await apiClient.get<{ name: string }>(
            `/organizations/${orgId}/attractions/${attractionId}`
          );
          setAttractionName(attractionData?.name ?? '');
        } catch {
          // Ignore - breadcrumb will show fallback
        }
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier, attractionId, loadAnnouncements]);

  async function loadAnnouncements(orgId: string) {
    try {
      const response = await apiClient.get<{ announcements: StorefrontAnnouncement[] }>(
        `/organizations/${orgId}/attractions/${attractionId}/storefront/announcements`
      );
      setAnnouncements(response?.announcements || []);
    } catch (_error) {
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
      startsAt: announcement.startsAt ? (announcement.startsAt.split('T')[0] ?? '') : '',
      endsAt: announcement.endsAt ? (announcement.endsAt.split('T')[0] ?? '') : '',
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
    } catch (_error) {
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
    } catch (_error) {
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
    } catch (_error) {
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

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attractionName || 'Attraction', href: basePath },
    { label: 'Storefront', href: `${basePath}/storefront` },
    { label: 'Announcements' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion}>
        <Breadcrumb items={breadcrumbs} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">
              Create announcements and promotions for your storefront.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        </div>
      </AnimatedPageHeader>

      {/* Stats */}
      <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion}>
        <AnimatedStatCard shouldReduceMotion={shouldReduceMotion}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAnnouncements.length}</div>
              <p className="text-xs text-muted-foreground">Currently showing</p>
            </CardContent>
          </Card>
        </AnimatedStatCard>
        <AnimatedStatCard shouldReduceMotion={shouldReduceMotion}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledAnnouncements.length}</div>
              <p className="text-xs text-muted-foreground">Future announcements</p>
            </CardContent>
          </Card>
        </AnimatedStatCard>
        <AnimatedStatCard shouldReduceMotion={shouldReduceMotion}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{announcements.length}</div>
              <p className="text-xs text-muted-foreground">All announcements</p>
            </CardContent>
          </Card>
        </AnimatedStatCard>
      </AnimatedStatsGrid>

      {/* Announcements List */}
      <AnimatedCard shouldReduceMotion={shouldReduceMotion} delay={0.15}>
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
              <AnimatedEmptyState shouldReduceMotion={shouldReduceMotion}>
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No announcements yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create announcements to inform your visitors about news, promotions, or alerts.
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Announcement
                </Button>
              </AnimatedEmptyState>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement, index) => {
                  const typeConfig = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.info;
                  const TypeIcon = typeConfig.icon;
                  const currentlyActive = isCurrentlyActive(announcement);

                  return (
                    <AnimatedAnnouncementRow
                      key={announcement.id}
                      shouldReduceMotion={shouldReduceMotion}
                      index={index}
                    >
                      <div
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
                            {!announcement.isActive && <Badge variant="secondary">Inactive</Badge>}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Announcement actions</span>
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
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(announcement)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </div>
                  </AnimatedAnnouncementRow>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedCard>

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
                onCheckedChange={(checked) => setFormData({ ...formData, isDismissible: checked })}
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
