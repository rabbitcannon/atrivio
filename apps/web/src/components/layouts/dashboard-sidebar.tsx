'use client';

import {
  Bell,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Ghost,
  LayoutDashboard,
  ListOrdered,
  type LucideIcon,
  Mail,
  Package,
  ScanLine,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrg } from '@/hooks/use-org';
import { cn } from '@/lib/utils/cn';
import { OrgSwitcher } from './org-switcher';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

// Admin/manager navigation - full dashboard access
const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '',
    icon: LayoutDashboard,
    roles: ['owner', 'admin', 'manager', 'hr'],
  },
  { label: 'Attractions', href: '/attractions', icon: Ghost, roles: ['owner', 'admin', 'manager'] },
  { label: 'Staff', href: '/staff', icon: Users, roles: ['owner', 'admin', 'manager', 'hr'] },
  { label: 'Schedule', href: '/schedule', icon: Calendar, roles: ['owner', 'admin', 'manager'] },
  {
    label: 'Ticketing',
    href: '/ticketing',
    icon: Ticket,
    roles: ['owner', 'admin', 'manager', 'box_office'],
  },
  {
    label: 'Check-In',
    href: '/check-in',
    icon: ScanLine,
    roles: ['owner', 'admin', 'manager', 'scanner'],
  },
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
  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['owner', 'admin', 'manager'],
  },
  { label: 'Members', href: '/members', icon: UserCog, roles: ['owner', 'admin', 'hr'] },
  { label: 'Invitations', href: '/invitations', icon: Mail, roles: ['owner', 'admin', 'hr'] },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { currentOrg, isLoading } = useOrg();

  // Only show skeleton on true first load (no cached org data)
  // This prevents flickering during page transitions
  if (isLoading && !currentOrg) {
    return (
      <aside className="flex h-full w-64 flex-col border-r bg-card">
        <div className="p-4">
          <Skeleton shimmer className="h-10 w-full" />
        </div>
        <div className="flex-1 space-y-2 p-4">
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'].map((id) => (
            <Skeleton shimmer key={id} className="h-10 w-full" />
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
              <Link
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
              </Link>
            );
          })}

        {/* Staff Navigation - shown to all staff including non-admin roles */}
        {staffNavItems.map((item) => {
          const href = `/${orgSlug}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href);

          return (
            <Link
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
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Settings Navigation */}
      <nav className="space-y-1 p-4" aria-label="Settings navigation">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Settings</p>
        {settingsNavItems
          .filter((item) => !item.roles || item.roles.includes(currentOrg.role))
          .map((item) => {
            const href = `/${orgSlug}${item.href}`;
            const isActive = pathname === href;

            return (
              <Link
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
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
