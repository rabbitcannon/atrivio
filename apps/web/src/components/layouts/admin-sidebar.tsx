'use client';

import {
  Activity,
  Building2,
  DollarSign,
  FileText,
  Flag,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
];

const systemNavItems: NavItem[] = [
  { label: 'Feature Flags', href: '/admin/feature-flags', icon: Flag },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
];

const configNavItems: NavItem[] = [
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'System Health', href: '/admin/health', icon: Activity },
  { label: 'Rate Limits', href: '/admin/rate-limits', icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[]) => (
    <>
      {items.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Admin Badge */}
      <div className="p-4">
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-destructive">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-semibold">Super Admin</span>
        </div>
      </div>

      <Separator />

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4" aria-label="Admin main navigation">
        {renderNavItems(mainNavItems)}
      </nav>

      <Separator />

      {/* System Navigation */}
      <nav className="space-y-1 p-4" aria-label="System navigation">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">System</p>
        {renderNavItems(systemNavItems)}
      </nav>

      <Separator />

      {/* Configuration Navigation */}
      <nav className="space-y-1 p-4" aria-label="Configuration navigation">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
          Configuration
        </p>
        {renderNavItems(configNavItems)}
      </nav>

      {/* Back to Dashboard */}
      <div className="p-4">
        <Separator className="mb-4" />
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Back to App
        </Link>
      </div>
    </aside>
  );
}
