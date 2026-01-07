import {
  ArrowLeft,
  Bell,
  FileText,
  type LucideIcon,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNotificationTemplates, resolveOrgId } from '@/lib/api';
import type { NotificationChannel, NotificationTemplate } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Notification Templates',
};

interface TemplatesPageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ channel?: NotificationChannel }>;
}

const CHANNEL_ICONS: Record<NotificationChannel, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  in_app: Bell,
};

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  email: 'Email',
  sms: 'SMS',
  push: 'Push',
  in_app: 'In-App',
};

function TemplateCard({ template }: { template: NotificationTemplate }) {
  const Icon = CHANNEL_ICONS[template.channel];

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{template.name}</CardTitle>
          </div>
          <div className="flex gap-2">
            {template.isSystem && <Badge variant="secondary">System</Badge>}
            <Badge variant={template.isActive ? 'default' : 'outline'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <CardDescription>{template.description || 'No description'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {template.subject && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subject</p>
              <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{template.subject}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Body Preview</p>
            <p className="text-sm font-mono bg-muted p-2 rounded mt-1 line-clamp-3 whitespace-pre-wrap">
              {template.body}
            </p>
          </div>
          {template.variables.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Variables</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="outline" className="font-mono text-xs">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TemplatesPage({ params, searchParams }: TemplatesPageProps) {
  const { orgId: orgIdentifier } = await params;
  const searchParamsResolved = await searchParams;
  const channel = searchParamsResolved.channel;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  const templatesResponse = await getNotificationTemplates(orgId, channel);
  const templates: NotificationTemplate[] = templatesResponse?.data?.data ?? [];

  // Group templates by channel
  const templatesByChannel: Record<NotificationChannel, NotificationTemplate[]> = {
    email: [],
    sms: [],
    push: [],
    in_app: [],
  };

  for (const template of templates) {
    templatesByChannel[template.channel].push(template);
  }

  const channels: NotificationChannel[] = ['email', 'sms', 'push', 'in_app'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${orgIdentifier}/notifications`}>
          <Button variant="ghost" size="icon" aria-label="Back to notifications">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Notification Templates</h1>
          <p className="text-muted-foreground">
            Manage templates for email, SMS, push, and in-app notifications.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({templates.length})</TabsTrigger>
          {channels.map((ch) => {
            const count = templatesByChannel[ch].length;
            if (count === 0) return null;
            return (
              <TabsTrigger key={ch} value={ch}>
                {CHANNEL_LABELS[ch]} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-muted-foreground mt-1">
                  System templates will appear after running database migrations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          )}
        </TabsContent>

        {channels.map((ch) => (
          <TabsContent key={ch} value={ch} className="space-y-4">
            {templatesByChannel[ch].length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No {CHANNEL_LABELS[ch]} templates</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {templatesByChannel[ch].map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
