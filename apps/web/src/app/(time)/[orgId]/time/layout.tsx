'use client';

import { ArrowLeftRight, Calendar, Clock, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0]?.toUpperCase() ?? 'U';
  }
  return 'U';
}

interface TimeLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default function TimeLayout({ children }: TimeLayoutProps) {
  const router = useRouter();
  const params = useParams<{ orgId: string }>();
  const pathname = usePathname();
  const orgSlug = params.orgId;
  const { user, isLoading } = useUser();
  const { clear: clearAuth } = useAuthStore();

  const NAV_ITEMS = [
    { href: `/${orgSlug}/time`, label: 'Clock', icon: Clock },
    { href: `/${orgSlug}/time/schedule`, label: 'Schedule', icon: Calendar },
    { href: `/${orgSlug}/time/swaps`, label: 'Swaps', icon: ArrowLeftRight },
    { href: `/${orgSlug}/time/availability`, label: 'Availability', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login' as never);
    router.refresh();
  }

  const userName = user?.user_metadata?.['full_name'] as string | undefined;
  const userEmail = user?.email;
  const userAvatar = user?.user_metadata?.['avatar_url'] as string | undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal Header */}
      <header className="flex h-14 items-center justify-between border-b bg-card px-4">
        {/* Logo + Time Clock branding */}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span className="font-semibold">Time Clock</span>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt={userName || userEmail || 'User'} />
                    <AvatarFallback>{getInitials(userName, userEmail)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {userName && <p className="text-sm font-medium leading-none">{userName}</p>}
                    {userEmail && (
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    Go to Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content - Full height, centered for mobile */}
      <main className="flex flex-1 flex-col pb-16">{children}</main>

      {/* Bottom Navigation - Mobile-friendly */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-card">
          <div className="flex items-center justify-around h-14">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
