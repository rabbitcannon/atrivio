'use client';

import { BarChart3, DollarSign, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { label: 'Overview', href: '', icon: BarChart3 },
  { label: 'Revenue', href: '/revenue', icon: DollarSign },
  { label: 'Attendance', href: '/attendance', icon: Users },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const orgId = params['orgId'] as string;
  const basePath = `/${orgId}/analytics`;

  return (
    <div className="container py-6 space-y-6">
      {/* Sub-navigation */}
      <nav className="flex gap-1 border-b pb-4">
        {NAV_ITEMS.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = pathname === href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
