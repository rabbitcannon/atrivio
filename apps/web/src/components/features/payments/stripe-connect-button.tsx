'use client';

import { ExternalLink, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createDashboardLink, createOnboardingLink, createStripeAccount } from '@/lib/api/payments';

interface StripeConnectButtonProps {
  orgId: string;
  mode: 'connect' | 'onboarding' | 'dashboard';
  variant?: 'default' | 'outline' | 'secondary';
}

export function StripeConnectButton({
  orgId,
  mode,
  variant = 'default',
}: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/${orgId}/payments`;
      const refreshUrl = `${window.location.origin}/${orgId}/payments?refresh=true`;

      let result;
      switch (mode) {
        case 'connect':
          result = await createStripeAccount(orgId, {
            return_url: returnUrl,
            refresh_url: refreshUrl,
          });
          break;
        case 'onboarding':
          result = await createOnboardingLink(orgId, {
            return_url: returnUrl,
            refresh_url: refreshUrl,
          });
          break;
        case 'dashboard':
          result = await createDashboardLink(orgId, {
            return_url: returnUrl,
          });
          break;
      }

      if (result.error) {
        setError(result.error.message || 'Failed to connect to Stripe');
        return;
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return mode === 'dashboard' ? 'Opening...' : 'Connecting...';
    }
    switch (mode) {
      case 'connect':
        return 'Connect with Stripe';
      case 'onboarding':
        return 'Complete Setup';
      case 'dashboard':
        return 'View Stripe Dashboard';
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={isLoading} variant={variant}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : mode === 'dashboard' ? (
          <ExternalLink className="mr-2 h-4 w-4" />
        ) : null}
        {getButtonText()}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
