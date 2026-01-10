'use client';

import { Link2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DomainLimitCounterProps {
  customDomainCount: number;
  customDomainLimit: number;
  customDomainsByAttraction: Array<{
    attractionId: string;
    attractionName: string;
    domains: string[];
  }>;
}

export function DomainLimitCounter({
  customDomainCount,
  customDomainLimit,
  customDomainsByAttraction,
}: DomainLimitCounterProps) {
  // Debug: remove after verifying
  console.log('Domain limits:', { customDomainCount, customDomainLimit, customDomainsByAttraction });

  const hasOtherDomains = customDomainsByAttraction.length > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 cursor-help">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {customDomainCount} of {customDomainLimit}
            </span>
            <span className="text-sm text-muted-foreground">custom domains</span>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs bg-popover text-popover-foreground border shadow-md"
        >
          {hasOtherDomains ? (
            <div className="space-y-2 p-1">
              <p className="font-medium text-sm">Custom domains in use:</p>
              <ul className="space-y-1 text-sm">
                {customDomainsByAttraction.map((attraction) => (
                  <li key={attraction.attractionId}>
                    <span className="font-medium">{attraction.attractionName}:</span>{' '}
                    <span className="text-muted-foreground">{attraction.domains.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm">No custom domains configured yet</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
