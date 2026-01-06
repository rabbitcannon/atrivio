'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import type { StorefrontAnnouncement } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AnnouncementBannerProps {
  announcement: StorefrontAnnouncement;
}

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const typeStyles = {
    info: 'bg-blue-600',
    warning: 'bg-yellow-500 text-black',
    success: 'bg-green-600',
    promo: 'bg-storefront-primary',
  };

  const bgColor = announcement.backgroundColor || typeStyles[announcement.type as keyof typeof typeStyles] || 'bg-storefront-primary';
  const textColor = announcement.textColor || (announcement.type === 'warning' ? 'text-black' : 'text-white');

  return (
    <div
      className={cn('relative py-2 px-4 text-center text-sm', textColor)}
      style={{
        backgroundColor: announcement.backgroundColor || undefined,
        color: announcement.textColor || undefined,
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <span className="font-medium">{announcement.title}</span>
        {announcement.content && <span className="hidden sm:inline">— {announcement.content}</span>}
        {announcement.linkUrl && announcement.linkText && (
          <a
            href={announcement.linkUrl}
            className="underline underline-offset-2 hover:no-underline font-semibold"
          >
            {announcement.linkText}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
