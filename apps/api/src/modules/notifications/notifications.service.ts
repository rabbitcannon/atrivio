import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  NotificationChannel,
  NotificationCategory,
  NotificationStatus,
  SendNotificationDto,
  SendDirectNotificationDto,
  UpdateTemplateDto,
  UpdatePreferencesDto,
  RegisterDeviceDto,
  NotificationTemplateResponse,
  NotificationResponse,
  InAppNotificationResponse,
  PreferenceResponse,
} from './dto/index.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly twilioConfigured: boolean;
  private readonly sendgridConfigured: boolean;

  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
  ) {
    // Check if providers are configured
    this.twilioConfigured = !!(
      this.config.get('TWILIO_ACCOUNT_SID') &&
      this.config.get('TWILIO_AUTH_TOKEN') &&
      this.config.get('TWILIO_PHONE_NUMBER') &&
      !this.config.get('TWILIO_ACCOUNT_SID')?.startsWith('your_')
    );

    this.sendgridConfigured = !!(
      this.config.get('SENDGRID_API_KEY') &&
      !this.config.get('SENDGRID_API_KEY')?.startsWith('SG.your_')
    );

    if (!this.twilioConfigured) {
      this.logger.warn('Twilio not configured - SMS will be logged only');
    }
    if (!this.sendgridConfigured) {
      this.logger.warn('SendGrid not configured - Emails will be logged only');
    }
  }

  // ===========================================================================
  // SMS (Twilio)
  // ===========================================================================

  async sendSms(to: string, body: string, orgId?: string): Promise<{ success: boolean; messageId?: string }> {
    if (!this.twilioConfigured) {
      this.logger.log(`[DEV SMS] To: ${to}, Body: ${body}`);
      return { success: true, messageId: `dev_${Date.now()}` };
    }

    try {
      // Dynamic import to avoid issues when Twilio isn't installed
      const twilio = await import('twilio');
      const client = twilio.default(
        this.config.get('TWILIO_ACCOUNT_SID'),
        this.config.get('TWILIO_AUTH_TOKEN'),
      );

      const fromNumber = this.config.get<string>('TWILIO_PHONE_NUMBER');
      if (!fromNumber) {
        throw new Error('TWILIO_PHONE_NUMBER not configured');
      }

      const message = await client.messages.create({
        to,
        from: fromNumber,
        body,
      });

      this.logger.log(`SMS sent to ${to}, SID: ${message.sid}`);

      // Record in database
      if (orgId) {
        await this.recordNotification({
          orgId,
          channel: 'sms',
          category: 'system',
          recipientPhone: to,
          body,
          status: 'sent',
          providerMessageId: message.sid,
        });
      }

      return { success: true, messageId: message.sid };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}:`, error);
      return { success: false };
    }
  }

  // ===========================================================================
  // Email (SendGrid)
  // ===========================================================================

  async sendEmail(
    to: string,
    subject: string,
    body: string,
    orgId?: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    if (!this.sendgridConfigured) {
      this.logger.log(`[DEV EMAIL] To: ${to}, Subject: ${subject}, Body: ${body}`);
      return { success: true, messageId: `dev_${Date.now()}` };
    }

    try {
      // Dynamic import
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(this.config.get('SENDGRID_API_KEY')!);

      const msg = {
        to,
        from: {
          email: this.config.get('SENDGRID_FROM_EMAIL') || 'noreply@hauntplatform.com',
          name: this.config.get('SENDGRID_FROM_NAME') || 'Haunt Platform',
        },
        subject,
        text: body,
        html: body.replace(/\n/g, '<br>'),
      };

      const [response] = await sgMail.default.send(msg);
      const messageId = response.headers['x-message-id'];

      this.logger.log(`Email sent to ${to}, ID: ${messageId}`);

      if (orgId) {
        await this.recordNotification({
          orgId,
          channel: 'email',
          category: 'system',
          recipientEmail: to,
          subject,
          body,
          status: 'sent',
          providerMessageId: messageId,
        });
      }

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return { success: false };
    }
  }

  // ===========================================================================
  // Template-Based Notifications
  // ===========================================================================

  async sendFromTemplate(
    orgId: string,
    dto: SendNotificationDto,
  ): Promise<{ success: boolean; sentCount: number }> {
    // Get template
    const template = await this.getTemplate(orgId, dto.templateKey, dto.channel);
    if (!template) {
      throw new NotFoundException(`Template not found: ${dto.templateKey}`);
    }

    // Interpolate variables
    let body = template.body;
    let subject = template.subject || '';

    if (dto.variables) {
      for (const [key, value] of Object.entries(dto.variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        body = body.replace(regex, value);
        subject = subject.replace(regex, value);
      }
    }

    let sentCount = 0;

    // Send to each recipient
    if (dto.channel === 'sms' && dto.recipientPhones) {
      for (const phone of dto.recipientPhones) {
        const result = await this.sendSms(phone, body, orgId);
        if (result.success) sentCount++;
      }
    } else if (dto.channel === 'email' && dto.recipientEmails) {
      for (const email of dto.recipientEmails) {
        const result = await this.sendEmail(email, subject, body, orgId);
        if (result.success) sentCount++;
      }
    } else if (dto.channel === 'in_app' && dto.recipientIds) {
      for (const userId of dto.recipientIds) {
        await this.createInAppNotification(userId, orgId, {
          category: 'system',
          title: subject || template.name,
          body,
        });
        sentCount++;
      }
    }

    return { success: sentCount > 0, sentCount };
  }

  async sendDirect(orgId: string, dto: SendDirectNotificationDto): Promise<{ success: boolean }> {
    if (dto.channel === 'sms' && dto.phone) {
      return this.sendSms(dto.phone, dto.body, orgId);
    } else if (dto.channel === 'email' && dto.email) {
      return this.sendEmail(dto.email, dto.subject || 'Notification', dto.body, orgId);
    }

    throw new BadRequestException('Invalid channel or missing recipient');
  }

  // ===========================================================================
  // In-App Notifications
  // ===========================================================================

  async getInAppNotifications(
    userId: string,
    options?: { read?: boolean; limit?: number },
  ): Promise<{ data: InAppNotificationResponse[]; unreadCount: number }> {
    let query = this.supabase.adminClient
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(options?.limit ?? 20);

    if (options?.read !== undefined) {
      query = query.eq('read', options.read);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get unread count
    const { count } = await this.supabase.adminClient
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return {
      data: (data || []).map((row) => this.mapInAppNotification(row)),
      unreadCount: count || 0,
    };
  }

  async createInAppNotification(
    userId: string,
    orgId: string | null,
    notification: { category: NotificationCategory; title: string; body: string; data?: Record<string, unknown> },
  ): Promise<void> {
    const { error } = await this.supabase.adminClient.from('in_app_notifications').insert({
      user_id: userId,
      org_id: orgId,
      category: notification.category,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    });

    if (error) throw error;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('in_app_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('in_app_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  // ===========================================================================
  // Templates
  // ===========================================================================

  async getTemplates(orgId: string, channel?: NotificationChannel): Promise<NotificationTemplateResponse[]> {
    let query = this.supabase.adminClient
      .from('notification_templates')
      .select('*')
      .or(`org_id.is.null,org_id.eq.${orgId}`)
      .eq('is_active', true);

    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data, error } = await query.order('key');
    if (error) throw error;

    return (data || []).map((row) => this.mapTemplate(row));
  }

  async getTemplate(
    orgId: string,
    key: string,
    channel: NotificationChannel,
  ): Promise<NotificationTemplateResponse | null> {
    // First try org-specific template, then fall back to system template
    const { data, error } = await this.supabase.adminClient
      .from('notification_templates')
      .select('*')
      .or(`org_id.is.null,org_id.eq.${orgId}`)
      .eq('key', key)
      .eq('channel', channel)
      .order('org_id', { ascending: false, nullsFirst: false }) // Org-specific first
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapTemplate(data) : null;
  }

  async updateTemplate(orgId: string, templateId: string, dto: UpdateTemplateDto): Promise<void> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.subject !== undefined) updateData['subject'] = dto.subject;
    if (dto.body !== undefined) updateData['body'] = dto.body;
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;

    const { error } = await this.supabase.adminClient
      .from('notification_templates')
      .update(updateData)
      .eq('id', templateId)
      .eq('org_id', orgId);

    if (error) throw error;
  }

  // ===========================================================================
  // Preferences
  // ===========================================================================

  async getPreferences(userId: string, orgId?: string): Promise<PreferenceResponse[]> {
    const categoryNames: Record<NotificationCategory, string> = {
      tickets: 'Tickets & Orders',
      queue: 'Virtual Queue',
      schedule: 'Schedule Updates',
      announcements: 'Announcements',
      marketing: 'Promotions & Marketing',
      system: 'System Notifications',
    };

    // Get existing preferences
    let query = this.supabase.adminClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId);

    if (orgId) {
      query = query.or(`org_id.is.null,org_id.eq.${orgId}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Build complete preferences list with defaults
    const categories: NotificationCategory[] = ['tickets', 'queue', 'schedule', 'announcements', 'marketing', 'system'];
    const existingPrefs = new Map(
      (data || []).map((p: Record<string, unknown>) => [p['category'] as string, p])
    );

    return categories.map(category => {
      const pref = existingPrefs.get(category) as Record<string, unknown> | undefined;
      return {
        category,
        categoryName: categoryNames[category],
        emailEnabled: (pref?.['email_enabled'] as boolean) ?? (category !== 'marketing'),
        smsEnabled: (pref?.['sms_enabled'] as boolean) ?? false,
        pushEnabled: (pref?.['push_enabled'] as boolean) ?? (category !== 'marketing'),
      };
    });
  }

  async updatePreferences(userId: string, orgId: string | null, dto: UpdatePreferencesDto): Promise<void> {
    for (const pref of dto.preferences) {
      const upsertData: Record<string, unknown> = {
        user_id: userId,
        org_id: orgId,
        category: pref.category,
        updated_at: new Date().toISOString(),
      };

      if (pref.emailEnabled !== undefined) upsertData['email_enabled'] = pref.emailEnabled;
      if (pref.smsEnabled !== undefined) upsertData['sms_enabled'] = pref.smsEnabled;
      if (pref.pushEnabled !== undefined) upsertData['push_enabled'] = pref.pushEnabled;

      const { error } = await this.supabase.adminClient
        .from('notification_preferences')
        .upsert(upsertData, {
          onConflict: 'user_id,org_id,category',
        });

      if (error) throw error;
    }
  }

  // ===========================================================================
  // Push Devices
  // ===========================================================================

  async registerDevice(userId: string, dto: RegisterDeviceDto): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('push_devices')
      .upsert({
        user_id: userId,
        device_token: dto.deviceToken,
        platform: dto.platform,
        device_name: dto.deviceName,
        is_active: true,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: 'device_token',
      });

    if (error) throw error;
  }

  async unregisterDevice(userId: string, deviceToken: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('push_devices')
      .delete()
      .eq('user_id', userId)
      .eq('device_token', deviceToken);

    if (error) throw error;
  }

  // ===========================================================================
  // Notification History
  // ===========================================================================

  async getNotificationHistory(
    orgId: string,
    options?: { channel?: NotificationChannel; status?: string; limit?: number; offset?: number },
  ): Promise<{ data: NotificationResponse[]; total: number }> {
    let query = this.supabase.adminClient
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (options?.channel) {
      query = query.eq('channel', options.channel);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    query = query.range(
      options?.offset ?? 0,
      (options?.offset ?? 0) + (options?.limit ?? 50) - 1,
    );

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: (data || []).map((row) => this.mapNotification(row)),
      total: count || 0,
    };
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private async recordNotification(notification: {
    orgId: string;
    channel: NotificationChannel;
    category: NotificationCategory;
    recipientEmail?: string;
    recipientPhone?: string;
    subject?: string;
    body: string;
    status: string;
    providerMessageId?: string;
  }): Promise<void> {
    await this.supabase.adminClient.from('notifications').insert({
      org_id: notification.orgId,
      channel: notification.channel,
      category: notification.category,
      recipient_type: 'guest',
      recipient_email: notification.recipientEmail,
      recipient_phone: notification.recipientPhone,
      subject: notification.subject,
      body: notification.body,
      status: notification.status,
      sent_at: new Date().toISOString(),
      provider_message_id: notification.providerMessageId,
    });
  }

  private mapTemplate(row: Record<string, unknown>): NotificationTemplateResponse {
    return {
      id: row['id'] as string,
      key: row['key'] as string,
      name: row['name'] as string,
      description: row['description'] as string | null,
      channel: row['channel'] as NotificationChannel,
      subject: row['subject'] as string | null,
      body: row['body'] as string,
      variables: (row['variables'] as string[]) || [],
      isSystem: row['is_system'] as boolean,
      isActive: row['is_active'] as boolean,
    };
  }

  private mapNotification(row: Record<string, unknown>): NotificationResponse {
    return {
      id: row['id'] as string,
      channel: row['channel'] as NotificationChannel,
      category: row['category'] as NotificationCategory,
      recipientEmail: row['recipient_email'] as string | null,
      recipientPhone: row['recipient_phone'] as string | null,
      subject: row['subject'] as string | null,
      body: row['body'] as string,
      status: row['status'] as NotificationStatus,
      sentAt: row['sent_at'] as string | null,
      deliveredAt: row['delivered_at'] as string | null,
      openedAt: row['opened_at'] as string | null,
      error: row['error'] as string | null,
      createdAt: row['created_at'] as string,
    };
  }

  private mapInAppNotification(row: Record<string, unknown>): InAppNotificationResponse {
    return {
      id: row['id'] as string,
      category: row['category'] as NotificationCategory,
      title: row['title'] as string,
      body: row['body'] as string,
      data: (row['data'] as Record<string, unknown>) || {},
      read: row['read'] as boolean,
      createdAt: row['created_at'] as string,
    };
  }
}
