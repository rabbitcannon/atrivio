'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ChevronRight,
  Home,
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Ticket,
  ScanLine,
  Settings,
  CreditCard,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  items?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      { title: 'Quick Start', href: '/docs/getting-started/quick-start' },
      { title: 'Account Setup', href: '/docs/getting-started/account-setup' },
      { title: 'Your First Organization', href: '/docs/getting-started/first-organization' },
      { title: 'Key Concepts', href: '/docs/getting-started/key-concepts' },
    ],
  },
  {
    title: 'User Guides',
    icon: <LayoutDashboard className="h-4 w-4" />,
    items: [
      {
        title: 'Dashboard',
        icon: <Home className="h-4 w-4" />,
        items: [
          { title: 'Overview', href: '/docs/user-guides/dashboard/overview' },
          { title: 'Navigation', href: '/docs/user-guides/dashboard/navigation' },
        ],
      },
      {
        title: 'Staff Management',
        icon: <Users className="h-4 w-4" />,
        items: [
          { title: 'Adding Staff', href: '/docs/user-guides/staff/adding-staff' },
          { title: 'Roles & Permissions', href: '/docs/user-guides/staff/roles-permissions' },
        ],
      },
      {
        title: 'Time Clock',
        icon: <Clock className="h-4 w-4" />,
        items: [
          { title: 'Clocking In/Out', href: '/docs/user-guides/time-clock/clocking-in-out' },
          { title: 'Time Reports', href: '/docs/user-guides/time-clock/time-reports' },
        ],
      },
      {
        title: 'Scheduling',
        icon: <Calendar className="h-4 w-4" />,
        items: [
          { title: 'Creating Shifts', href: '/docs/user-guides/scheduling/creating-shifts' },
          { title: 'Shift Templates', href: '/docs/user-guides/scheduling/shift-templates' },
          { title: 'Availability', href: '/docs/user-guides/scheduling/availability' },
        ],
      },
      {
        title: 'Ticketing',
        icon: <Ticket className="h-4 w-4" />,
        items: [
          { title: 'Ticket Types', href: '/docs/user-guides/ticketing/ticket-types' },
          { title: 'Promo Codes', href: '/docs/user-guides/ticketing/promo-codes' },
          { title: 'Orders', href: '/docs/user-guides/ticketing/orders' },
        ],
      },
      {
        title: 'Check-In',
        icon: <ScanLine className="h-4 w-4" />,
        items: [
          { title: 'Scanning Tickets', href: '/docs/user-guides/check-in/scanning-tickets' },
          { title: 'Walk-Up Guests', href: '/docs/user-guides/check-in/walk-up-guests' },
        ],
      },
    ],
  },
  {
    title: 'Admin Guides',
    icon: <Settings className="h-4 w-4" />,
    items: [
      {
        title: 'Organization',
        items: [
          { title: 'Settings', href: '/docs/admin-guides/organization/settings' },
          { title: 'Branding', href: '/docs/admin-guides/organization/branding' },
          { title: 'Members', href: '/docs/admin-guides/organization/members' },
        ],
      },
      {
        title: 'Payments',
        icon: <CreditCard className="h-4 w-4" />,
        items: [
          { title: 'Stripe Setup', href: '/docs/admin-guides/payments/stripe-setup' },
          { title: 'Payouts', href: '/docs/admin-guides/payments/payouts' },
        ],
      },
      {
        title: 'Storefront',
        icon: <Store className="h-4 w-4" />,
        items: [
          { title: 'Setup', href: '/docs/admin-guides/storefront/setup' },
          { title: 'Pages', href: '/docs/admin-guides/storefront/pages' },
          { title: 'Custom Domains', href: '/docs/admin-guides/storefront/custom-domains' },
        ],
      },
    ],
  },
];

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = item.href ? pathname === item.href : false;
  const hasChildren = item.items && item.items.length > 0;
  const [isOpen, setIsOpen] = useState(true);

  if (hasChildren) {
    return (
      <div className={cn(depth > 0 && 'ml-3')}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-colors'
          )}
        >
          {item.icon}
          <span className="flex-1 text-left">{item.title}</span>
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')}
          />
        </button>
        {isOpen && (
          <div className="mt-1 space-y-1">
            {item.items?.map((child) => (
              <NavLink key={child.title} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        depth > 0 && 'ml-3',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {item.icon}
      <span>{item.title}</span>
    </Link>
  );
}

function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn('w-64 flex-shrink-0', className)}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto py-6 pr-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.title} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r z-50 lg:hidden overflow-y-auto p-4">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">Documentation</span>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <NavLink key={item.title} item={item} />
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">Atrivio</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/docs/getting-started/quick-start"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container flex">
        <Sidebar className="hidden lg:block border-r" />
        <main className="flex-1 min-w-0">
          <article className="max-w-3xl mx-auto py-10 px-4 lg:px-8">
            {children}
          </article>
        </main>
      </div>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
