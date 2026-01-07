'use client';

import { AlertTriangle, Info, Megaphone, PartyPopper, X, Zap } from 'lucide-react';
import { useState } from 'react';
import type { StorefrontAnnouncement } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AnnouncementBannerProps {
  announcement: StorefrontAnnouncement;
}

const typeConfig = {
  info: {
    bg: 'bg-blue-600',
    text: 'text-white',
    icon: Info,
    iconColor: 'text-blue-200',
  },
  warning: {
    bg: 'bg-amber-500',
    text: 'text-amber-950',
    icon: AlertTriangle,
    iconColor: 'text-amber-800',
  },
  critical: {
    bg: 'bg-red-600',
    text: 'text-white',
    icon: Zap,
    iconColor: 'text-red-200',
  },
  success: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    icon: PartyPopper,
    iconColor: 'text-emerald-200',
  },
  promo: {
    bg: 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400',
    text: 'text-white',
    icon: Megaphone,
    iconColor: 'text-white/80',
  },
};

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const config = typeConfig[announcement.type as keyof typeof typeConfig] || typeConfig.info;
  const Icon = config.icon;
  const hasCustomColors = announcement.backgroundColor || announcement.textColor;

  return (
    <div
      className={cn(
        'relative py-2.5 px-4 text-sm',
        !hasCustomColors && config.bg,
        !hasCustomColors && config.text
      )}
      style={{
        backgroundColor: announcement.backgroundColor || undefined,
        color: announcement.textColor || undefined,
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Icon className={cn('h-4 w-4 shrink-0', !hasCustomColors && config.iconColor)} />
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="font-semibold">{announcement.title}</span>
          {announcement.content && (
            <span className="hidden sm:inline opacity-90">— {announcement.content}</span>
          )}
          {announcement.linkUrl && announcement.linkText && (
            <a
              href={announcement.linkUrl}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all',
                'bg-white/20 hover:bg-white/30 backdrop-blur-sm',
                'border border-white/20'
              )}
            >
              {announcement.linkText}
            </a>
          )}
        </div>
      </div>
      {announcement.isDismissible !== false && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
