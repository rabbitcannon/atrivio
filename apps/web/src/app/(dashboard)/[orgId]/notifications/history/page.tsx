import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  type LucideIcon,
  Mail,
  MessageSquare,
  MousePointerClick,
  Smartphone,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getNotificationHistory, resolveOrgId } from '@/lib/api';
import type { Notification, NotificationChannel, NotificationStatus } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Notification History',
};

interface HistoryPageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ channel?: NotificationChannel; status?: NotificationStatus }>;
}

const CHANNEL_ICONS: Record<NotificationChannel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  in_app: Bell,
};

const STATUS_CONFIG: Record<
  NotificationStatus,
  { icon: LucideIcon; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
> = {
  pending: { icon: Clock, variant: 'secondary', label: 'Pending' },
  queued: { icon: Clock, variant: 'secondary', label: 'Queued' },
  sent: { icon: CheckCircle, variant: 'outline', label: 'Sent' },
  delivered: { icon: CheckCircle, variant: 'default', label: 'Delivered' },
  opened: { icon: Eye, variant: 'default', label: 'Opened' },
  clicked: { icon: MousePointerClick, variant: 'default', label: 'Clicked' },
  failed: { icon: XCircle, variant: 'destructive', label: 'Failed' },
  bounced: { icon: AlertCircle, variant: 'destructive', label: 'Bounced' },
  unsubscribed: { icon: XCircle, variant: 'secondary', label: 'Unsubscribed' },
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
}

function NotificationRow({ notification }: { notification: Notification }) {
  const ChannelIcon = CHANNEL_ICONS[notification.channel];
  const statusConfig = STATUS_CONFIG[notification.status];
  const StatusIcon = statusConfig.icon;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <ChannelIcon className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">{notification.channel}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {notification.category}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[200px] truncate">
        {notification.recipientEmail || notification.recipientPhone || '-'}
      </TableCell>
      <TableCell className="max-w-[250px] truncate">
        {notification.subject || notification.body.substring(0, 50)}
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig.variant} className="gap-1">
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formatDate(notification.sentAt || notification.createdAt)}
      </TableCell>
      <TableCell>
        {notification.error && (
          <span className="text-sm text-destructive">{notification.error}</span>
        )}
      </TableCell>
    </TableRow>
  );
}

export default async function HistoryPage({ params, searchParams }: HistoryPageProps) {
  const { orgId: orgIdentifier } = await params;
  const searchParamsResolved = await searchParams;
  const channel = searchParamsResolved.channel;
  const status = searchParamsResolved.status;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Build filters object conditionally to avoid undefined values
  const filters: { channel?: NotificationChannel; status?: NotificationStatus; limit: number } = {
    limit: 50,
  };
  if (channel) filters.channel = channel;
  if (status) filters.status = status;

  const historyResponse = await getNotificationHistory(orgId, filters);
  const notifications: Notification[] = historyResponse?.data?.data ?? [];
  const total = historyResponse?.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${orgIdentifier}/notifications`}>
          <Button variant="ghost" size="icon" aria-label="Back to notifications">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Notification History</h1>
          <p className="text-muted-foreground">
            View sent notifications and their delivery status.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-2">
              <Link href={`/${orgIdentifier}/notifications/history`}>
                <Button variant={!channel ? 'default' : 'outline'} size="sm">
                  All Channels
                </Button>
              </Link>
              <Link href={`/${orgIdentifier}/notifications/history?channel=email`}>
                <Button variant={channel === 'email' ? 'default' : 'outline'} size="sm">
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              </Link>
              <Link href={`/${orgIdentifier}/notifications/history?channel=sms`}>
                <Button variant={channel === 'sms' ? 'default' : 'outline'} size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" /> SMS
                </Button>
              </Link>
              <Link href={`/${orgIdentifier}/notifications/history?channel=push`}>
                <Button variant={channel === 'push' ? 'default' : 'outline'} size="sm">
                  <Smartphone className="h-4 w-4 mr-1" /> Push
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Showing {notifications.length} of {total} notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No notifications sent yet</h3>
              <p className="text-muted-foreground mt-1">
                Notifications will appear here after they are sent.
              </p>
              <Link href={`/${orgIdentifier}/notifications/send`}>
                <Button className="mt-4">Send a Notification</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <NotificationRow key={notification.id} notification={notification} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
