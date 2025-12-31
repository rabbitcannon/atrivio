'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Settings, User, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-user';
import { useAuthStore } from '@/stores/auth-store';
import { useOrgStore } from '@/stores/org-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

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

export function AdminHeader() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { clear: clearAuth } = useAuthStore();
  const { clear: clearOrg } = useOrgStore();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearAuth();
    clearOrg();
    router.push('/login' as never);
    router.refresh();
  }

  const userName = user?.user_metadata?.['full_name'] as string | undefined;
  const userEmail = user?.email;
  const userAvatar = user?.user_metadata?.['avatar_url'] as string | undefined;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Logo */}
      <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
        <span role="img" aria-label="Ghost">
          👻
        </span>
        <span className="hidden sm:inline">Haunt Admin</span>
        <span className="ml-2 rounded-md bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
          ADMIN
        </span>
      </Link>

      {/* User Menu */}
      <div className="flex items-center gap-4">
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
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {userName && <p className="text-sm font-medium leading-none">{userName}</p>}
                  {userEmail && (
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                  )}
                  <div className="flex items-center gap-1 pt-1">
                    <Shield className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-destructive">Super Admin</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Back to App
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
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
  );
}
