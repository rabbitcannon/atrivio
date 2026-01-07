'use client';

import { useEffect, useState } from 'react';
import { X, Info, AlertTriangle, AlertCircle, Wrench, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getActiveAnnouncements, dismissAnnouncement, type PlatformAnnouncement } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

const typeConfig = {
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    titleClass: 'text-blue-900 dark:text-blue-100',
    textClass: 'text-blue-800 dark:text-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    titleClass: 'text-amber-900 dark:text-amber-100',
    textClass: 'text-amber-800 dark:text-amber-200',
  },
  critical: {
    icon: AlertCircle,
    bgClass: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-900 dark:text-red-100',
    textClass: 'text-red-800 dark:text-red-200',
  },
  maintenance: {
    icon: Wrench,
    bgClass: 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-700',
    iconClass: 'text-slate-600 dark:text-slate-400',
    titleClass: 'text-slate-900 dark:text-slate-100',
    textClass: 'text-slate-700 dark:text-slate-300',
  },
  feature: {
    icon: Sparkles,
    bgClass: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
    iconClass: 'text-purple-600 dark:text-purple-400',
    titleClass: 'text-purple-900 dark:text-purple-100',
    textClass: 'text-purple-800 dark:text-purple-200',
  },
};

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await getActiveAnnouncements();
        if (response.data?.announcements) {
          setAnnouncements(response.data.announcements);
        }
      } catch (error) {
        // Silently fail - announcements are non-critical
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  const handleDismiss = async (announcementId: string) => {
    try {
      await dismissAnnouncement(announcementId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    } catch (error) {
      console.error('Failed to dismiss announcement:', error);
    }
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {announcements.map((announcement) => {
        const config = typeConfig[announcement.type] || typeConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={announcement.id}
            role="alert"
            className={cn(
              'relative flex items-start gap-3 rounded-lg border p-4',
              config.bgClass
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconClass)} />
            <div className="flex-1 min-w-0">
              <h4 className={cn('font-medium text-sm', config.titleClass)}>
                {announcement.title}
              </h4>
              <p className={cn('text-sm mt-1', config.textClass)}>
                {announcement.content}
              </p>
              {announcement.link_url && (
                <a
                  href={announcement.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'inline-flex items-center gap-1 text-sm mt-2 font-medium underline underline-offset-2',
                    config.iconClass
                  )}
                >
                  {announcement.link_text || 'Learn more'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {announcement.is_dismissible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => handleDismiss(announcement.id)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
