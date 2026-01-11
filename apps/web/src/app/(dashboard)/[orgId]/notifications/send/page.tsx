'use client';

import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { NotificationCategory } from '@/lib/api/types';

const CATEGORIES: { value: NotificationCategory; label: string }[] = [
  { value: 'tickets', label: 'Tickets' },
  { value: 'queue', label: 'Queue' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'system', label: 'System' },
];

export default function SendNotificationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orgId = params['orgId'] as string;

  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('announcements');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !body) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (channel === 'email' && !subject) {
      toast({
        title: 'Validation Error',
        description: 'Email notifications require a subject.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/organizations/${orgId}/notifications/send-direct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          [channel === 'email' ? 'email' : 'phone']: recipient,
          subject: channel === 'email' ? subject : undefined,
          body,
          category,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send notification');
      }

      toast({
        title: 'Notification Sent',
        description: `${channel === 'email' ? 'Email' : 'SMS'} notification has been queued for delivery.`,
      });

      // Reset form
      setRecipient('');
      setSubject('');
      setBody('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center gap-4">
        <Link href={`/${orgId}/notifications`}>
          <Button variant="ghost" size="icon" aria-label="Back to notifications">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Send Notification</h1>
          <p className="text-muted-foreground">Send a direct email or SMS notification.</p>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>
            Send a one-time notification to a recipient. For recurring notifications, use templates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Channel Selection */}
            <div className="space-y-3">
              <Label>Channel</Label>
              <RadioGroup
                value={channel}
                onValueChange={(value: string) => setChannel(value as 'email' | 'sms')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4" /> SMS
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value: string) => setCategory(value as NotificationCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label htmlFor="recipient">
                {channel === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <Input
                id="recipient"
                type={channel === 'email' ? 'email' : 'tel'}
                placeholder={channel === 'email' ? 'recipient@example.com' : '+1234567890'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
              {channel === 'sms' && (
                <p className="text-xs text-muted-foreground">
                  Enter phone number in E.164 format (e.g., +1234567890)
                </p>
              )}
            </div>

            {/* Subject (Email only) */}
            {channel === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Notification subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder={
                  channel === 'email'
                    ? 'Email body content...'
                    : 'SMS message (160 chars recommended)...'
                }
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={channel === 'email' ? 8 : 4}
                required
              />
              {channel === 'sms' && (
                <p className="text-xs text-muted-foreground">
                  {body.length} characters. SMS messages over 160 characters may be split.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" isLoading={isLoading} loadingText="Sending...">
                <Send className="h-4 w-4" />
                Send Notification
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/${orgId}/notifications`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </FadeIn>

      {/* Tips */}
      <FadeIn delay={0.15}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Email:</strong> Requires SendGrid API key configured in environment variables.
            </p>
            <p>
              <strong>SMS:</strong> Requires Twilio credentials configured in environment variables.
            </p>
            <p>
              <strong>Templates:</strong> For repeated notifications, create a template for
              consistency.
            </p>
            <p>
              <strong>Bulk sending:</strong> Use the API directly for sending to multiple recipients.
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
