'use client';

import { ArrowRight, Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredTier?: string | null;
}

/**
 * Displays an upgrade prompt when a feature requires a higher subscription tier
 */
export function UpgradePrompt({ feature, description, requiredTier }: UpgradePromptProps) {
  const params = useParams();
  const orgId = params['orgId'] as string;

  const tierLabel = requiredTier === 'enterprise' ? 'Enterprise' : 'Pro';

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl flex items-center justify-center gap-2">
          <Lock className="h-5 w-5" />
          {feature} Requires {tierLabel}
        </CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Upgrade your subscription to access {feature.toLowerCase()} and other premium features.
        </p>
        <Button asChild>
          <Link href={`/${orgId}/settings/billing`}>
            Upgrade Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
