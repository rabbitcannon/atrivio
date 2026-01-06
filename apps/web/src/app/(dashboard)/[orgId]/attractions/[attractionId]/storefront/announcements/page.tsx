import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Home,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Tag,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveOrgId, getStorefrontAnnouncements } from '@/lib/api';
import type { StorefrontAnnouncement, AnnouncementType } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Storefront Announcements',
};

interface AnnouncementsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

const TYPE_CONFIG: Record<AnnouncementType, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Info }> = {
  info: { label: 'Info', variant: 'secondary', icon: Info },
  warning: { label: 'Warning', variant: 'outline', icon: AlertTriangle },
  success: { label: 'Success', variant: 'default', icon: CheckCircle },
  promotion: { label: 'Promotion', variant: 'outline', icon: Tag },
  urgent: { label: 'Urgent', variant: 'destructive', icon: Bell },
};

export default async function StorefrontAnnouncementsPage({ params }: AnnouncementsPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  let announcements: StorefrontAnnouncement[] = [];

  try {
    const result = await getStorefrontAnnouncements(orgId, attractionId);
    announcements = result.data?.announcements ?? [];
  } catch {
    // Feature might not be enabled
  }

  const activeAnnouncements = announcements.filter((a) => a.isActive);
  const homeAnnouncements = announcements.filter((a) => a.showOnHome);
  const scheduledAnnouncements = announcements.filter(
    (a) => a.startsAt && new Date(a.startsAt) > new Date()
  );

  const isCurrentlyActive = (announcement: StorefrontAnnouncement) => {
    if (!announcement.isActive) return false;
    const now = new Date();
    if (announcement.startsAt && new Date(announcement.startsAt) > now) return false;
    if (announcement.endsAt && new Date(announcement.endsAt) < now) return false;
    return true;
  };

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
        <Button disabled>
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
            <p className="text-xs text-muted-foreground">
              Currently showing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Homepage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{homeAnnouncements.length}</div>
            <p className="text-xs text-muted-foreground">
              Featured announcements
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledAnnouncements.length}</div>
            <p className="text-xs text-muted-foreground">
              Future announcements
            </p>
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
          <CardDescription>
            {announcements.length} total announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No announcements yet</h3>
              <p className="text-muted-foreground mb-4">
                Create announcements to inform your visitors about news, promotions, or alerts.
              </p>
              <Button disabled>
                <Plus className="mr-2 h-4 w-4" />
                Create First Announcement
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const typeConfig = TYPE_CONFIG[announcement.type];
                const TypeIcon = typeConfig.icon;
                const currentlyActive = isCurrentlyActive(announcement);

                return (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg border ${
                      !currentlyActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{announcement.title}</h4>
                            <Badge variant={typeConfig.variant}>
                              {typeConfig.label}
                            </Badge>
                            {announcement.showOnHome && (
                              <Badge variant="outline">
                                <Home className="mr-1 h-3 w-3" />
                                Homepage
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
                        <Button variant="ghost" size="icon" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground text-center">
        Announcement management will be available in a future update.
      </p>
    </div>
  );
}
