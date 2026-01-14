'use client';

import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Crown,
  Globe,
  Lock,
  MessageSquare,
  Package,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Feature highlights by tier with icons
const TIER_FEATURES = {
  pro: {
    color: 'from-blue-500/10 via-indigo-500/5 to-purple-500/10',
    borderColor: 'border-blue-500/30',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-500',
    price: '$149/mo',
    highlights: [
      { icon: Calendar, label: 'Staff scheduling & shift management' },
      { icon: Package, label: 'Inventory tracking & checkout system' },
      { icon: BarChart3, label: 'Advanced analytics & PDF reports' },
      { icon: Globe, label: 'Public storefronts for ticket sales' },
    ],
  },
  enterprise: {
    color: 'from-amber-500/10 via-orange-500/5 to-red-500/10',
    borderColor: 'border-amber-500/30',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    iconColor: 'text-amber-500',
    price: '$499/mo',
    highlights: [
      { icon: Users, label: 'Virtual queue with real-time tracking' },
      { icon: MessageSquare, label: 'SMS notifications for guests & staff' },
      { icon: Globe, label: 'Custom domain support with SSL' },
      { icon: Zap, label: 'API access for integrations' },
    ],
  },
};

// Feature-specific benefits to show relevant context
const FEATURE_BENEFITS: Record<string, string[]> = {
  'Staff Scheduling': [
    'Create and manage shift schedules',
    'Track staff availability preferences',
    'Handle shift swap requests',
    'Use reusable shift templates',
  ],
  'Scheduling': [
    'Create and manage shift schedules',
    'Track staff availability preferences',
    'Handle shift swap requests',
    'Use reusable shift templates',
  ],
  'Virtual Queue': [
    'Reduce physical wait times for guests',
    'Real-time position tracking via SMS',
    'Batch processing for smooth flow',
    'Analytics on wait times & throughput',
  ],
  'Analytics': [
    'Track revenue & ticket sales trends',
    'Monitor attendance patterns',
    'Compare performance across periods',
    'Export reports to PDF',
  ],
  'Inventory': [
    'Track props, costumes & equipment',
    'Manage checkouts & returns',
    'Get low stock alerts',
    'Categorize and organize items',
  ],
  'Storefronts': [
    'Public ticket sales pages',
    'Customizable themes & branding',
    'Event calendars & FAQs',
    'Announcement banners',
  ],
  'Custom Domains': [
    'Use your own domain for storefronts',
    'Automatic SSL certificate provisioning',
    'Professional branding',
    'Multiple domains per attraction',
  ],
  'SMS Notifications': [
    'Queue position updates for guests',
    'Shift reminders for staff',
    'Event announcements',
    'Two-way messaging support',
  ],
};

interface UpgradePromptProps {
  feature: string;
  description: string;
  requiredTier?: string | null;
  /** Compact mode for inline use */
  compact?: boolean;
}

/**
 * Displays an upgrade prompt when a feature requires a higher subscription tier
 */
export function UpgradePrompt({ feature, description, requiredTier, compact = false }: UpgradePromptProps) {
  const params = useParams();
  const orgId = params['orgId'] as string;

  const tier = requiredTier === 'enterprise' ? 'enterprise' : 'pro';
  const tierConfig = TIER_FEATURES[tier];
  const tierLabel = tier === 'enterprise' ? 'Enterprise' : 'Pro';
  const featureBenefits = FEATURE_BENEFITS[feature] || [];

  if (compact) {
    return (
      <Card className={`${tierConfig.borderColor} bg-gradient-to-r ${tierConfig.color}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${tierConfig.badgeColor}`}>
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{feature}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <Button size="sm" asChild>
              <Link href={`/${orgId}/settings/billing`}>
                Upgrade to {tierLabel}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${tierConfig.borderColor} bg-gradient-to-br ${tierConfig.color} overflow-hidden`}>
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 relative">
          <div className={`rounded-full p-4 ${tierConfig.badgeColor}`}>
            {tier === 'enterprise' ? (
              <Crown className={`h-8 w-8 ${tierConfig.iconColor}`} />
            ) : (
              <Sparkles className={`h-8 w-8 ${tierConfig.iconColor}`} />
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="outline" className={tierConfig.badgeColor}>
            {tierLabel} Plan
          </Badge>
          <Badge variant="secondary">{tierConfig.price}</Badge>
        </div>
        <CardTitle className="text-2xl">Unlock {feature}</CardTitle>
        <CardDescription className="text-base max-w-lg mx-auto">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Feature-specific benefits */}
        {featureBenefits.length > 0 && (
          <div className="bg-background/50 rounded-lg p-4 border border-border/50">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              What you&apos;ll get with {feature}
            </h4>
            <ul className="grid gap-2 sm:grid-cols-2">
              {featureBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tier highlights */}
        <div>
          <h4 className="text-sm font-medium mb-3">
            Everything in {tierLabel} includes:
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {tierConfig.highlights.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg bg-background/50 p-3 border border-border/50"
              >
                <item.icon className={`h-5 w-5 ${tierConfig.iconColor} shrink-0`} />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href={`/${orgId}/settings/billing`}>
              Upgrade to {tierLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Cancel anytime • No long-term commitment
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
