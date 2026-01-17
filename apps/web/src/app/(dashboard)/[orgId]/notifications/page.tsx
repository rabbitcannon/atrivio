import { Bell, FileText, History, Mail, MessageSquare, Send, Smartphone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { getCurrentUserRole, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Notifications',
};

interface NotificationsPageProps {
  params: Promise<{ orgId: string }>;
}

const NAV_ITEMS = [
  {
    title: 'Templates',
    description: 'Manage notification templates for email, SMS, and push',
    href: '/notifications/templates',
    icon: FileText,
    roles: ['owner', 'admin'],
  },
  {
    title: 'Send Notification',
    description: 'Send a notification to staff or customers',
    href: '/notifications/send',
    icon: Send,
    roles: ['owner', 'admin', 'manager'],
  },
  {
    title: 'History',
    description: 'View sent notifications and delivery status',
    href: '/notifications/history',
    icon: History,
    roles: ['owner', 'admin', 'manager', 'finance'],
  },
];

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const userRole = await getCurrentUserRole(orgId);

  // Filter nav items based on user's role
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  return (
    <div className="space-y-6">
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Manage templates, send notifications, and view delivery history.
        </p>
      </AnimatedPageHeader>

      {/* Quick Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4" staggerDelay={0.05} delayChildren={0.1}>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Email Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Push Sent</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Active templates</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Navigation Cards */}
      <FadeIn delay={0.15}>
        <div className="grid gap-4 md:grid-cols-3">
          {visibleNavItems.map((item) => (
            <Link key={item.href} href={`/${orgIdentifier}${item.href}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* Channel Configuration Status */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Channel Configuration
            </CardTitle>
            <CardDescription>Status of notification channel integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Mail className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Email (SendGrid)</p>
                  <p className="text-sm text-muted-foreground">Check .env for SENDGRID_API_KEY</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">SMS (Twilio)</p>
                  <p className="text-sm text-muted-foreground">Check .env for TWILIO_* keys</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                <Bell className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">In-App</p>
                  <p className="text-sm text-muted-foreground">Always available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
