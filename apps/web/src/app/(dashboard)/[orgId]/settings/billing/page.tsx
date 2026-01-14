'use client';

import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Loader2,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { Progress } from '@/components/ui/progress';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getSubscriptionWithUsage,
  type SubscriptionWithUsage,
} from '@/lib/api/client';
import { getPricingTiers, type PricingTier } from '@/lib/api/pricing';

interface TierDisplayConfig {
  name: string;
  price: string;
  period: string;
  icon: typeof Building2;
  color: string;
  features: string[];
  notIncluded: string[];
}

// Default tier config (will be updated with database prices)
const DEFAULT_TIER_CONFIG: Record<'free' | 'pro' | 'enterprise', TierDisplayConfig> = {
  free: {
    name: 'Free',
    price: '$0',
    period: '/month',
    icon: Building2,
    color: 'text-muted-foreground',
    features: [
      'Up to 1 attraction',
      'Up to 10 staff members',
      '100 orders/month',
      'Basic ticketing',
      'Check-in & scanning',
      'Time tracking',
      'Email notifications',
    ],
    notIncluded: [
      'Staff scheduling',
      'Inventory management',
      'Advanced analytics',
      'Custom domains',
      'Media uploads',
      'Virtual queue',
      'SMS notifications',
    ],
  },
  pro: {
    name: 'Pro',
    price: '$149',
    period: '/month',
    icon: Zap,
    color: 'text-blue-500',
    features: [
      'Up to 5 attractions',
      'Up to 50 staff members',
      '1,000 orders/month',
      'Staff scheduling',
      'Inventory management',
      'Advanced analytics',
      'Storefronts',
      'Up to 5 custom domains',
      '500 MB media storage',
      'Everything in Free',
    ],
    notIncluded: ['Virtual queue', 'SMS notifications', 'Unlimited resources', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    price: '$499',
    period: '/month',
    icon: Crown,
    color: 'text-amber-500',
    features: [
      'Unlimited attractions',
      'Unlimited staff members',
      'Unlimited orders',
      'Virtual queue management',
      'SMS notifications',
      'Up to 10 custom domains',
      '5 GB media storage',
      'API access',
      'Priority support',
      'Everything in Pro',
    ],
    notIncluded: [],
  },
};

interface UsageEntry {
  current: number;
  limit: number;
  remaining: number | 'unlimited';
}

function UsageProgress({ label, usage }: { label: string; usage: UsageEntry }) {
  const isUnlimited = usage.limit === -1 || usage.remaining === 'unlimited';
  const percentage = isUnlimited ? 0 : Math.min((usage.current / usage.limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={isNearLimit ? 'text-amber-500 font-medium' : 'text-muted-foreground'}>
          {usage.current} / {isUnlimited ? 'Unlimited' : usage.limit.toLocaleString()}
        </span>
      </div>
      {!isUnlimited && (
        <Progress value={percentage} className={isNearLimit ? '[&>div]:bg-amber-500' : ''} />
      )}
    </div>
  );
}

export default function BillingPage() {
  const params = useParams();
  const orgId = params['orgId'] as string;

  const [subscription, setSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [tierConfig, setTierConfig] = useState<Record<'free' | 'pro' | 'enterprise', TierDisplayConfig>>(DEFAULT_TIER_CONFIG);

  // Fetch pricing from database
  useEffect(() => {
    async function fetchPricing() {
      try {
        const apiTiers = await getPricingTiers();
        if (apiTiers.length > 0) {
          setTierConfig((prev) => {
            const updated = { ...prev };
            for (const apiTier of apiTiers) {
              if (apiTier.tier in updated) {
                const tierKey = apiTier.tier as 'free' | 'pro' | 'enterprise';
                updated[tierKey] = {
                  ...updated[tierKey],
                  name: apiTier.name,
                  price: apiTier.monthlyPrice,
                };
              }
            }
            return updated;
          });
        }
      } catch (error) {
        // Keep defaults on error
        console.error('Failed to fetch pricing:', error);
      }
    }
    fetchPricing();
  }, []);

  useEffect(() => {
    async function fetchSubscription() {
      setLoading(true);
      const result = await getSubscriptionWithUsage(orgId);
      if (result.error) {
        setError(result.error.message);
      } else if (result.data) {
        setSubscription(result.data);
      }
      setLoading(false);
    }
    fetchSubscription();
  }, [orgId]);

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    setUpgrading(tier);
    setError(null);
    const currentUrl = window.location.href;
    const result = await createCheckoutSession(orgId, {
      tier,
      successUrl: `${currentUrl}?upgraded=true`,
      cancelUrl: currentUrl,
    });

    if (result.error) {
      // Check for specific Stripe configuration error
      if (result.error.message.includes('Price not configured') ||
          result.error.message.includes('STRIPE_NOT_CONFIGURED')) {
        setError(
          'Subscription upgrades are not available yet. Please contact support or try again later.'
        );
      } else {
        setError(result.error.message);
      }
      setUpgrading(null);
      return;
    }

    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  };

  const handleManageBilling = async () => {
    setOpeningPortal(true);
    const result = await createBillingPortalSession(orgId, window.location.href);

    if (result.error) {
      setError(result.error.message);
      setOpeningPortal(false);
      return;
    }

    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subscription && !error) {
    return null;
  }

  // If we only have an error from initial fetch and no subscription data
  if (!subscription && error) {
    return (
      <div className="space-y-6">
        <AnimatedPageHeader>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing information.
          </p>
        </AnimatedPageHeader>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading subscription</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // At this point we have subscription data (possibly with an action error)
  // TypeScript knows subscription is defined here
  const sub = subscription!;

  const currentTier = sub.tier;
  const currentTierConfig = tierConfig[currentTier];
  const TierIcon = currentTierConfig.icon;

  const canUpgradeToPro = currentTier === 'free';
  const canUpgradeToEnterprise = currentTier !== 'enterprise';
  const hasPaidSubscription = sub.stripeSubscriptionId !== null;

  return (
    <div className="space-y-8">
      <AnimatedPageHeader>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information.
        </p>
      </AnimatedPageHeader>

      {/* Error Alert (for action errors) */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-primary/10 ${currentTierConfig.color}`}>
                  <TierIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentTierConfig.name} Plan
                    {currentTier !== 'free' && (
                      <Badge variant="secondary" className="ml-2">
                        {sub.status === 'active' ? 'Active' : sub.status}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {currentTierConfig.price}
                    {currentTierConfig.period}
                  </CardDescription>
                </div>
              </div>
              {hasPaidSubscription && (
                <Button variant="outline" onClick={handleManageBilling} disabled={openingPortal}>
                  {openingPortal ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="h-4 w-4 mr-2" />
                  )}
                  Manage Billing
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <UsageProgress label="Attractions" usage={sub.usage.attractions} />
              <UsageProgress label="Staff Members" usage={sub.usage.staffMembers} />
              <UsageProgress label="Custom Domains" usage={sub.usage.customDomains} />
            </div>

            {sub.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                {sub.cancelAtPeriodEnd ? (
                  <>
                    Your subscription will end on{' '}
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </>
                ) : (
                  <>
                    Next billing date:{' '}
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Plan Comparison */}
      <FadeIn delay={0.2}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(Object.entries(tierConfig) as [keyof typeof tierConfig, (typeof tierConfig)[keyof typeof tierConfig]][]).map(
              ([tier, config]) => {
                const Icon = config.icon;
                const isCurrentTier = tier === currentTier;
                const canUpgrade =
                  (tier === 'pro' && canUpgradeToPro) ||
                  (tier === 'enterprise' && canUpgradeToEnterprise);

                return (
                  <Card
                    key={tier}
                    className={`relative ${isCurrentTier ? 'border-primary ring-1 ring-primary' : ''}`}
                  >
                    {isCurrentTier && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary">Current Plan</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div
                        className={`mx-auto p-3 rounded-full bg-muted w-fit ${config.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <div className="text-2xl font-bold">
                        {config.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          {config.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        {config.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {config.notIncluded.slice(0, 3).map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                            <X className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {canUpgrade && (
                        <Button
                          className="w-full"
                          onClick={() => handleUpgrade(tier as 'pro' | 'enterprise')}
                          disabled={upgrading !== null}
                        >
                          {upgrading === tier ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Redirecting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Upgrade to {config.name}
                            </>
                          )}
                        </Button>
                      )}
                      {isCurrentTier && tier !== 'free' && (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              }
            )}
          </div>
        </div>
      </FadeIn>

      {/* Feature Comparison */}
      <FadeIn delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>Feature Comparison</CardTitle>
            <CardDescription>See what's included in each plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 font-medium">Free</th>
                    <th className="text-center py-3 px-4 font-medium">Pro</th>
                    <th className="text-center py-3 px-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 pr-4">Attractions</td>
                    <td className="text-center py-3 px-4">1</td>
                    <td className="text-center py-3 px-4">5</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Staff Members</td>
                    <td className="text-center py-3 px-4">10</td>
                    <td className="text-center py-3 px-4">50</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Orders/Month</td>
                    <td className="text-center py-3 px-4">100</td>
                    <td className="text-center py-3 px-4">1,000</td>
                    <td className="text-center py-3 px-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Staff Scheduling</td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Inventory Management</td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Advanced Analytics</td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Virtual Queue</td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">SMS Notifications</td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Custom Domains</td>
                    <td className="text-center py-3 px-4">0</td>
                    <td className="text-center py-3 px-4">5</td>
                    <td className="text-center py-3 px-4">10</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Media Storage</td>
                    <td className="text-center py-3 px-4">-</td>
                    <td className="text-center py-3 px-4">500 MB</td>
                    <td className="text-center py-3 px-4">5 GB</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
