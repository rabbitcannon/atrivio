'use client';

import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useOrg } from '@/hooks/use-org';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

function getOrgInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function OrgSwitcher() {
  const { currentOrg, organizations, isLoading, switchOrg } = useOrg();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (!currentOrg) {
    return (
      <Button variant="outline" className="w-full justify-start" asChild>
        <a href="/onboarding">
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" aria-haspopup="listbox">
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentOrg.logoUrl} alt={currentOrg.name} />
              <AvatarFallback className="text-xs">{getOrgInitials(currentOrg.name)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{currentOrg.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrg(org)}
            className="cursor-pointer"
          >
            <Avatar className="mr-2 h-6 w-6">
              <AvatarImage src={org.logoUrl} alt={org.name} />
              <AvatarFallback className="text-xs">{getOrgInitials(org.name)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{org.name}</span>
            {currentOrg.id === org.id && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="/onboarding">
            <Plus className="mr-2 h-4 w-4" />
            Create Organization
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
