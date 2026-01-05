'use client';

import { usePathname } from 'next/navigation';
import {
  Building2,
  Ghost,
  Users,
  Calendar,
  LayoutDashboard,
  UserCog,
  Mail,
  Clock,
  CreditCard,
  Ticket,
  ScanLine,
  Package,
  ListOrdered,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useOrg } from '@/hooks/use-org';
import { OrgSwitcher } from './org-switcher';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

// Admin/manager navigation - full dashboard access
const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '', icon: LayoutDashboard, roles: ['owner', 'admin', 'manager', 'hr'] },
  { label: 'Attractions', href: '/attractions', icon: Ghost, roles: ['owner', 'admin', 'manager'] },
  { label: 'Staff', href: '/staff', icon: Users, roles: ['owner', 'admin', 'manager', 'hr'] },
  { label: 'Schedule', href: '/schedule', icon: Calendar, roles: ['owner', 'admin', 'manager'] },
  { label: 'Ticketing', href: '/ticketing', icon: Ticket, roles: ['owner', 'admin', 'manager', 'box_office'] },
  { label: 'Check-In', href: '/check-in', icon: ScanLine, roles: ['owner', 'admin', 'manager', 'scanner'] },
  { label: 'Queue', href: '/queue', icon: ListOrdered, roles: ['owner', 'admin', 'manager'] },
  { label: 'Inventory', href: '/inventory', icon: Package, roles: ['owner', 'admin', 'manager'] },
];

// Staff-only navigation - for actors, scanners, box_office, finance
const staffNavItems: NavItem[] = [
  { label: 'My Schedule', href: '/my-schedule', icon: Calendar },
  { label: 'Time Tracking', href: '/my-time', icon: Clock },
];

const settingsNavItems: NavItem[] = [
  { label: 'Organization', href: '/settings', icon: Building2, roles: ['owner', 'admin'] },
  { label: 'Payments', href: '/payments', icon: CreditCard, roles: ['owner', 'admin', 'finance'] },
  { label: 'Members', href: '/members', icon: UserCog, roles: ['owner', 'admin', 'hr'] },
  { label: 'Invitations', href: '/invitations', icon: Mail, roles: ['owner', 'admin', 'hr'] },
];


export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentOrg, isLoading } = useOrg();

  if (isLoading) {
    return (
      <aside className="flex h-full w-64 flex-col border-r bg-card">
        <div className="p-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 space-y-2 p-4">
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((id) => (
            <Skeleton key={id} className="h-10 w-full" />
          ))}
        </div>
      </aside>
    );
  }

  if (!currentOrg) {
    return null;
  }

  const orgSlug = currentOrg.slug;

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Org Switcher */}
      <div className="p-4">
        <OrgSwitcher />
      </div>

      <Separator />

      {/* Main Navigation - filtered by role */}
      <nav className="flex-1 space-y-1 p-4" aria-label="Main navigation">
        {/* Admin/Manager Navigation */}
        {adminNavItems
          .filter((item) => !item.roles || item.roles.includes(currentOrg.role))
          .map((item) => {
            const href = `/${orgSlug}${item.href}`;
            const isActive = pathname === href || (item.href !== '' && pathname.startsWith(href));

            return (
              <a
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}

        {/* Staff Navigation - shown to all staff including non-admin roles */}
        {staffNavItems.map((item) => {
          const href = `/${orgSlug}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href);

          return (
            <a
              key={item.href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <Separator />

      {/* Settings Navigation */}
      <nav className="space-y-1 p-4" aria-label="Settings navigation">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
          Settings
        </p>
        {settingsNavItems
          .filter((item) => !item.roles || item.roles.includes(currentOrg.role))
          .map((item) => {
            const href = `/${orgSlug}${item.href}`;
            const isActive = pathname === href;

            return (
              <a
                key={item.href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
      </nav>
    </aside>
  );
}
