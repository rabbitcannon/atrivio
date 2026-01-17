'use client';

import { AlertTriangle, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/hooks/use-impersonation';

/**
 * Banner displayed when a super admin is impersonating another user.
 * Shows the impersonated user's info and provides a way to end impersonation.
 */
export function ImpersonationBanner() {
  const { isImpersonating, impersonatedUser, expiresAt, endImpersonation, isProcessing } =
    useImpersonation();

  if (!isImpersonating || !impersonatedUser) {
    return null;
  }

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins <= 0) return 'Expired';
    if (diffMins < 60) return `${diffMins}m remaining`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m remaining`;
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-amber-500 text-amber-950">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              <span>
                Impersonating: <strong>{impersonatedUser.name}</strong>
                <span className="hidden sm:inline"> ({impersonatedUser.email})</span>
              </span>
            </div>
            {expiresAt && (
              <span className="hidden md:inline text-xs bg-amber-600/30 px-2 py-0.5 rounded">
                {getTimeRemaining()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden lg:inline text-xs opacity-75">
              All actions are being logged
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={endImpersonation}
              disabled={isProcessing}
              className="bg-amber-900 text-amber-50 hover:bg-amber-800 border-0"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">End Impersonation</span>
              <span className="sm:hidden">End</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

