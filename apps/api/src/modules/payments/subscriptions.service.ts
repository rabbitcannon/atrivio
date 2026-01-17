import type { OrgId, UserId } from '@atrivio/shared';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { AuditService } from '../../core/audit/audit.service.js';
import { SupabaseService } from '../../shared/database/supabase.service.js';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export interface TierLimits {
  customDomains: number;
  attractions: number;
  staffMembers: number;
  monthlyOrders: number;
  features: string[];
}

export interface TierConfig {
  tier: SubscriptionTier;
  name: string;
  description: string;
  monthlyPriceCents: number;
  transactionFeePercentage: number;
  transactionFeeFixedCents: number;
  customDomainsLimit: number;
  attractionsLimit: number;
  staffMembersLimit: number;
  features: string[];
  isActive: boolean;
  displayOrder: number;
  metadata: Record<string, unknown>;
  stripePriceId: string | null;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: TierLimits;
}

// Fallback tier configuration (used if database lookup fails)
const FALLBACK_TIER_CONFIG: Record<SubscriptionTier, TierLimits> = {
  free: {
    customDomains: 0,
    attractions: 1,
    staffMembers: 10,
    monthlyOrders: -1,
    features: ['ticketing', 'checkin', 'time_tracking', 'notifications'],
  },
  pro: {
    customDomains: 5,
    attractions: 5,
    staffMembers: 50,
    monthlyOrders: -1,
    features: ['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts'],
  },
  enterprise: {
    customDomains: 10,
    attractions: -1,
    staffMembers: -1,
    monthlyOrders: -1,
    features: ['ticketing', 'checkin', 'time_tracking', 'notifications', 'scheduling', 'inventory', 'analytics_pro', 'storefronts', 'virtual_queue', 'sms_notifications', 'custom_domains'],
  },
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: Stripe;

  // Fallback price IDs from environment (deprecated - use admin panel instead)
  private readonly fallbackProPriceId = process.env['STRIPE_PRO_PRICE_ID'];
  private readonly fallbackEnterprisePriceId = process.env['STRIPE_ENTERPRISE_PRICE_ID'];

  // Cache for tier config (refreshed every 5 minutes)
  private tierConfigCache: Map<SubscriptionTier, TierConfig> = new Map();
  private tierConfigCacheExpiry = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private supabase: SupabaseService,
    private audit: AuditService
  ) {
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Subscription operations will fail');
      this.stripe = new Stripe('sk_test_dummy_key_for_initialization');
    } else {
      this.stripe = new Stripe(stripeKey);
    }
  }

  /**
   * Refresh tier config cache from database
   */
  private async refreshTierConfigCache(): Promise<void> {
    const now = Date.now();
    if (now < this.tierConfigCacheExpiry && this.tierConfigCache.size > 0) {
      return; // Cache is still valid
    }

    const { data, error } = await this.supabase.adminClient
      .from('subscription_tier_config')
      .select('*')
      .eq('is_active', true);

    if (error || !data) {
      this.logger.warn(`Failed to fetch tier config from database: ${error?.message}`);
      return; // Use cached data or fallback
    }

    this.tierConfigCache.clear();
    for (const row of data) {
      const config: TierConfig = {
        tier: row.tier as SubscriptionTier,
        name: row.name,
        description: row.description,
        monthlyPriceCents: row.monthly_price_cents,
        transactionFeePercentage: Number(row.transaction_fee_percentage),
        transactionFeeFixedCents: row.transaction_fee_fixed_cents,
        customDomainsLimit: row.custom_domains_limit,
        attractionsLimit: row.attractions_limit,
        staffMembersLimit: row.staff_members_limit,
        features: row.features,
        isActive: row.is_active,
        displayOrder: row.display_order,
        metadata: row.metadata || {},
        stripePriceId: row.stripe_price_id || null,
      };
      this.tierConfigCache.set(config.tier, config);
    }
    this.tierConfigCacheExpiry = now + this.CACHE_TTL_MS;
    this.logger.debug(`Refreshed tier config cache with ${data.length} tiers`);
  }

  /**
   * Invalidate the tier config cache (call after admin updates)
   */
  invalidateTierConfigCache(): void {
    this.tierConfigCacheExpiry = 0;
    this.tierConfigCache.clear();
    this.logger.debug('Tier config cache invalidated');
  }

  /**
   * Get full tier configuration (for admin panel)
   */
  async getTierConfig(tier: SubscriptionTier): Promise<TierConfig | null> {
    await this.refreshTierConfigCache();
    return this.tierConfigCache.get(tier) || null;
  }

  /**
   * Get all tier configurations (for admin panel)
   */
  async getAllTierConfigs(): Promise<TierConfig[]> {
    await this.refreshTierConfigCache();
    return Array.from(this.tierConfigCache.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Get tier limits configuration
   */
  async getTierLimits(tier: SubscriptionTier): Promise<TierLimits> {
    await this.refreshTierConfigCache();
    const config = this.tierConfigCache.get(tier);

    if (!config) {
      this.logger.warn(`Tier ${tier} not found in cache, using fallback`);
      return FALLBACK_TIER_CONFIG[tier] || FALLBACK_TIER_CONFIG.free;
    }

    return {
      customDomains: config.customDomainsLimit,
      attractions: config.attractionsLimit,
      staffMembers: config.staffMembersLimit,
      monthlyOrders: -1, // Always unlimited
      features: config.features,
    };
  }

  /**
   * Get tier limits synchronously (uses cache, may be stale)
   * Use this for non-critical checks where async is not possible
   */
  getTierLimitsSync(tier: SubscriptionTier): TierLimits {
    const config = this.tierConfigCache.get(tier);

    if (!config) {
      return FALLBACK_TIER_CONFIG[tier] || FALLBACK_TIER_CONFIG.free;
    }

    return {
      customDomains: config.customDomainsLimit,
      attractions: config.attractionsLimit,
      staffMembers: config.staffMembersLimit,
      monthlyOrders: -1,
      features: config.features,
    };
  }

  /**
   * Check if a tier has access to a feature
   */
  async tierHasFeature(tier: SubscriptionTier, feature: string): Promise<boolean> {
    const limits = await this.getTierLimits(tier);
    return limits.features.includes(feature);
  }

  /**
   * Update tier configuration (admin only)
   */
  async updateTierConfig(
    tier: SubscriptionTier,
    updates: Partial<Omit<TierConfig, 'tier'>>
  ): Promise<TierConfig> {
    const updateData: Record<string, unknown> = {};

    if (updates['name'] !== undefined) updateData['name'] = updates['name'];
    if (updates['description'] !== undefined) updateData['description'] = updates['description'];
    if (updates['monthlyPriceCents'] !== undefined) updateData['monthly_price_cents'] = updates['monthlyPriceCents'];
    if (updates['transactionFeePercentage'] !== undefined) updateData['transaction_fee_percentage'] = updates['transactionFeePercentage'];
    if (updates['transactionFeeFixedCents'] !== undefined) updateData['transaction_fee_fixed_cents'] = updates['transactionFeeFixedCents'];
    if (updates['customDomainsLimit'] !== undefined) updateData['custom_domains_limit'] = updates['customDomainsLimit'];
    if (updates['attractionsLimit'] !== undefined) updateData['attractions_limit'] = updates['attractionsLimit'];
    if (updates['staffMembersLimit'] !== undefined) updateData['staff_members_limit'] = updates['staffMembersLimit'];
    if (updates['features'] !== undefined) updateData['features'] = updates['features'];
    if (updates['isActive'] !== undefined) updateData['is_active'] = updates['isActive'];
    if (updates['displayOrder'] !== undefined) updateData['display_order'] = updates['displayOrder'];
    if (updates['metadata'] !== undefined) updateData['metadata'] = updates['metadata'];

    const { data, error } = await this.supabase.adminClient
      .from('subscription_tier_config')
      .update(updateData)
      .eq('tier', tier)
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(`Failed to update tier config: ${error?.message}`);
    }

    // Invalidate cache
    this.tierConfigCacheExpiry = 0;
    await this.refreshTierConfigCache();

    this.logger.log(`Updated tier config for ${tier}`);
    return this.tierConfigCache.get(tier)!;
  }

  /**
   * Create a new Stripe price for a subscription tier.
   * Stripe prices are immutable, so this creates a new price when the admin changes the price amount.
   * @param tier - The subscription tier (pro or enterprise)
   * @param amountCents - The monthly price in cents
   * @returns The new Stripe price ID
   */
  async createStripePrice(tier: SubscriptionTier, amountCents: number): Promise<string> {
    this.ensureStripeConfigured();

    if (tier === 'free' || amountCents === 0) {
      throw new BadRequestException('Cannot create Stripe price for free tier');
    }

    // Get or create a product for this tier
    const productId = await this.getOrCreateStripeProduct(tier);

    // Create a new recurring price
    const price = await this.stripe.prices.create({
      product: productId,
      unit_amount: amountCents,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier,
        created_by: 'admin_panel',
        created_at: new Date().toISOString(),
      },
    });

    this.logger.log(`Created Stripe price ${price.id} for ${tier} tier at $${amountCents / 100}/mo`);
    return price.id;
  }

  /**
   * Get or create a Stripe product for a subscription tier
   */
  private async getOrCreateStripeProduct(tier: SubscriptionTier): Promise<string> {
    const productMetadataKey = `atrivio_${tier}_product`;

    // Search for existing product with our metadata
    const existingProducts = await this.stripe.products.search({
      query: `metadata['atrivio_tier']:'${tier}'`,
      limit: 1,
    });

    const existingProduct = existingProducts.data[0];
    if (existingProduct) {
      return existingProduct.id;
    }

    // Create a new product
    const tierConfig = await this.getTierConfig(tier);
    const product = await this.stripe.products.create({
      name: tierConfig?.name || `Atrivio ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
      description: tierConfig?.description || `Atrivio ${tier} subscription plan`,
      metadata: {
        atrivio_tier: tier,
      },
    });

    this.logger.log(`Created Stripe product ${product.id} for ${tier} tier`);
    return product.id;
  }

  /**
   * Get subscription info for an organization
   */
  async getSubscription(orgId: OrgId): Promise<SubscriptionInfo> {
    const { data: org, error } = await this.supabase.adminClient
      .from('organizations')
      .select(
        'subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_current_period_end, subscription_cancel_at_period_end'
      )
      .eq('id', orgId)
      .single();

    if (error || !org) {
      throw new NotFoundException('Organization not found');
    }

    const tier = (org.subscription_tier as SubscriptionTier) || 'free';

    return {
      tier,
      status: (org.subscription_status as SubscriptionStatus) || 'active',
      stripeCustomerId: org.stripe_customer_id,
      stripeSubscriptionId: org.stripe_subscription_id,
      currentPeriodEnd: org.subscription_current_period_end,
      cancelAtPeriodEnd: org.subscription_cancel_at_period_end || false,
      limits: await this.getTierLimits(tier),
    };
  }

  /**
   * Get or create Stripe customer for org
   */
  async getOrCreateCustomer(orgId: OrgId): Promise<string> {
    this.ensureStripeConfigured();

    // Check if org already has a customer
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('stripe_customer_id, name, email')
      .eq('id', orgId)
      .single();

    if (org?.stripe_customer_id) {
      return org.stripe_customer_id;
    }

    // Create new Stripe customer
    const customer = await this.stripe.customers.create({
      name: org?.name || undefined,
      email: org?.email || undefined,
      metadata: {
        org_id: orgId,
      },
    });

    // Save customer ID to org
    await this.supabase.adminClient
      .from('organizations')
      .update({ stripe_customer_id: customer.id })
      .eq('id', orgId);

    this.logger.log(`Created Stripe customer ${customer.id} for org ${orgId}`);

    return customer.id;
  }

  /**
   * Create a checkout session for subscription upgrade
   */
  async createCheckoutSession(
    orgId: OrgId,
    tier: 'pro' | 'enterprise',
    successUrl: string,
    cancelUrl: string
  ): Promise<{ url: string; sessionId: string }> {
    this.ensureStripeConfigured();

    // Get price ID from database config, fall back to env vars for backwards compatibility
    await this.refreshTierConfigCache();
    const tierConfig = this.tierConfigCache.get(tier);
    const priceId = tierConfig?.stripePriceId
      || (tier === 'pro' ? this.fallbackProPriceId : this.fallbackEnterprisePriceId);

    if (!priceId) {
      throw new BadRequestException(`Price not configured for ${tier} tier. Please set the Stripe Price ID in the admin panel.`);
    }

    const customerId = await this.getOrCreateCustomer(orgId);

    // Check if org already has an active subscription
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('stripe_subscription_id, subscription_status')
      .eq('id', orgId)
      .single();

    if (org?.stripe_subscription_id && org.subscription_status === 'active') {
      throw new BadRequestException(
        'Organization already has an active subscription. Use the billing portal to change plans.'
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        org_id: orgId,
        tier,
      },
      subscription_data: {
        metadata: {
          org_id: orgId,
          tier,
        },
      },
    });

    this.logger.log(`Created checkout session ${session.id} for org ${orgId} tier ${tier}`);

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  /**
   * Create a billing portal session for subscription management
   */
  async createBillingPortalSession(
    orgId: OrgId,
    returnUrl: string
  ): Promise<{ url: string }> {
    this.ensureStripeConfigured();

    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', orgId)
      .single();

    if (!org?.stripe_customer_id) {
      throw new BadRequestException('No billing account found. Please subscribe to a plan first.');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: returnUrl,
    });

    return { url: session.url };
  }

  /**
   * Handle subscription created/updated webhook
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const orgId = subscription.metadata?.['org_id'];
    const tier = subscription.metadata?.['tier'] as SubscriptionTier;

    if (!orgId) {
      this.logger.warn(`Subscription ${subscription.id} has no org_id metadata`);
      return;
    }

    // Map Stripe status to our status
    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'active',
      trialing: 'trialing',
      past_due: 'past_due',
      canceled: 'canceled',
      unpaid: 'unpaid',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
    };

    const status = statusMap[subscription.status] || 'active';

    // Get previous tier for history
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    const previousTier = org?.subscription_tier as SubscriptionTier | undefined;

    // Access current_period_end via bracket notation (exists at runtime but not in TS types)
    const currentPeriodEnd = (subscription as unknown as Record<string, unknown>)[
      'current_period_end'
    ] as number | undefined;

    // Update organization
    await this.supabase.adminClient
      .from('organizations')
      .update({
        subscription_tier: tier || this.getTierFromPriceId(subscription.items.data[0]?.price.id),
        stripe_subscription_id: subscription.id,
        subscription_status: status,
        subscription_current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        subscription_cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('id', orgId);

    // Record history
    const newTier = tier || this.getTierFromPriceId(subscription.items.data[0]?.price.id);
    let eventType = 'created';
    if (previousTier && previousTier !== newTier) {
      eventType =
        this.getTierPriority(newTier) > this.getTierPriority(previousTier)
          ? 'upgraded'
          : 'downgraded';
    }

    await this.supabase.adminClient.from('subscription_history').insert({
      org_id: orgId,
      previous_tier: previousTier || null,
      new_tier: newTier,
      stripe_subscription_id: subscription.id,
      event_type: eventType,
      metadata: {
        stripe_status: subscription.status,
        current_period_end: currentPeriodEnd,
      },
    });

    // Log audit event for subscription change
    const auditAction =
      eventType === 'created'
        ? 'subscription.created'
        : eventType === 'upgraded'
          ? 'subscription.upgraded'
          : 'subscription.downgraded';

    await this.audit.log({
      actorType: 'webhook',
      action: auditAction,
      resourceType: 'subscription',
      resourceId: subscription.id,
      orgId: orgId as OrgId,
      changes: previousTier
        ? { tier: { from: previousTier, to: newTier } }
        : undefined,
      metadata: {
        new_tier: newTier,
        previous_tier: previousTier,
        stripe_status: subscription.status,
      },
    });

    this.logger.log(
      `Updated subscription for org ${orgId}: tier=${newTier}, status=${status}`
    );
  }

  /**
   * Handle subscription deleted webhook
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const orgId = subscription.metadata?.['org_id'];

    if (!orgId) {
      this.logger.warn(`Deleted subscription ${subscription.id} has no org_id metadata`);
      return;
    }

    // Get previous tier
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    // Downgrade to free tier
    await this.supabase.adminClient
      .from('organizations')
      .update({
        subscription_tier: 'free',
        stripe_subscription_id: null,
        subscription_status: 'canceled',
        subscription_current_period_end: null,
        subscription_cancel_at_period_end: false,
      })
      .eq('id', orgId);

    // Record history
    await this.supabase.adminClient.from('subscription_history').insert({
      org_id: orgId,
      previous_tier: org?.subscription_tier || 'free',
      new_tier: 'free',
      stripe_subscription_id: subscription.id,
      event_type: 'canceled',
      metadata: {
        canceled_at: new Date().toISOString(),
      },
    });

    // Log audit event for subscription cancellation
    await this.audit.log({
      actorType: 'webhook',
      action: 'subscription.canceled',
      resourceType: 'subscription',
      resourceId: subscription.id,
      orgId: orgId as OrgId,
      changes: {
        tier: { from: org?.subscription_tier || 'free', to: 'free' },
      },
      metadata: {
        previous_tier: org?.subscription_tier || 'free',
        canceled_at: new Date().toISOString(),
      },
    });

    this.logger.log(`Subscription canceled for org ${orgId}, downgraded to free`);
  }

  /**
   * Handle checkout session completed webhook
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.mode !== 'subscription') {
      return;
    }

    const orgId = session.metadata?.['org_id'];
    const tier = session.metadata?.['tier'] as SubscriptionTier;

    if (!orgId) {
      this.logger.warn(`Checkout session ${session.id} has no org_id metadata`);
      return;
    }

    // The subscription webhook will handle the actual update
    this.logger.log(`Checkout completed for org ${orgId}, tier ${tier}`);
  }

  /**
   * Manually set subscription tier (for admin/testing)
   */
  async setTier(
    orgId: OrgId,
    tier: SubscriptionTier,
    actorId?: UserId
  ): Promise<void> {
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('subscription_tier')
      .eq('id', orgId)
      .single();

    const previousTier = org?.subscription_tier as SubscriptionTier | undefined;

    await this.supabase.adminClient
      .from('organizations')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
      })
      .eq('id', orgId);

    // Record history
    await this.supabase.adminClient.from('subscription_history').insert({
      org_id: orgId,
      previous_tier: previousTier || null,
      new_tier: tier,
      event_type: 'manual',
      metadata: {
        actor_id: actorId || null,
        reason: 'Manual tier assignment',
      },
    });

    this.logger.log(`Manually set tier for org ${orgId} to ${tier}`);
  }

  /**
   * Get current usage for an organization
   */
  async getCurrentUsage(orgId: OrgId): Promise<{
    attractions: number;
    staffMembers: number;
    customDomains: number;
  }> {
    // Get attraction count
    const { count: attractionCount } = await this.supabase.adminClient
      .from('attractions')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId);

    // Get active staff member count
    const { count: staffCount } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active');

    // Get custom domain count
    const { count: domainCount } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('is_subdomain', false);

    return {
      attractions: attractionCount || 0,
      staffMembers: staffCount || 0,
      customDomains: domainCount || 0,
    };
  }

  /**
   * Get subscription with current usage
   */
  async getSubscriptionWithUsage(orgId: OrgId): Promise<
    SubscriptionInfo & {
      usage: {
        attractions: { current: number; limit: number; remaining: number | 'unlimited' };
        staffMembers: { current: number; limit: number; remaining: number | 'unlimited' };
        customDomains: { current: number; limit: number; remaining: number | 'unlimited' };
      };
    }
  > {
    const [subscription, usage] = await Promise.all([
      this.getSubscription(orgId),
      this.getCurrentUsage(orgId),
    ]);

    const formatUsage = (current: number, limit: number) => ({
      current,
      limit,
      remaining: limit === -1 ? ('unlimited' as const) : Math.max(0, limit - current),
    });

    return {
      ...subscription,
      usage: {
        attractions: formatUsage(usage.attractions, subscription.limits.attractions),
        staffMembers: formatUsage(usage.staffMembers, subscription.limits.staffMembers),
        customDomains: formatUsage(usage.customDomains, subscription.limits.customDomains),
      },
    };
  }

  /**
   * Get tier from Stripe price ID (checks cached database values and fallback env vars)
   */
  private getTierFromPriceId(priceId: string | undefined): SubscriptionTier {
    if (!priceId) return 'free';

    // Check cached database values
    for (const [tier, config] of this.tierConfigCache.entries()) {
      if (config.stripePriceId === priceId) {
        return tier;
      }
    }

    // Fallback to env vars for backwards compatibility
    if (priceId === this.fallbackProPriceId) return 'pro';
    if (priceId === this.fallbackEnterprisePriceId) return 'enterprise';

    return 'pro'; // Default to pro if unknown paid price
  }

  /**
   * Get tier priority for comparison
   */
  private getTierPriority(tier: SubscriptionTier): number {
    const priorities: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 1,
      enterprise: 2,
    };
    return priorities[tier] || 0;
  }

  private ensureStripeConfigured(): void {
    if (!process.env['STRIPE_SECRET_KEY']) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      });
    }
  }
}
