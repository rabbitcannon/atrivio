import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  org_ids: string[];
  user_ids: string[];
  metadata: Record<string, unknown>;
}

/**
 * Service for checking feature flags
 *
 * Uses the is_feature_enabled() SQL function which handles:
 * - Global enable/disable
 * - Specific org_ids allowlist
 * - Specific user_ids allowlist
 * - Rollout percentage (random selection)
 */
@Injectable()
export class FeaturesService {
  // Cache flags for 60 seconds to reduce DB calls
  private cache = new Map<string, { flag: FeatureFlag | null; expires: number }>();
  private readonly CACHE_TTL = 60 * 1000; // 60 seconds

  constructor(private supabase: SupabaseService) {}

  /**
   * Check if a feature is enabled for a given org/user
   *
   * @param featureKey - The feature flag key (e.g., 'scheduling', 'checkin')
   * @param orgId - Optional org ID for org-specific flags
   * @param userId - Optional user ID for user-specific flags
   */
  async isEnabled(featureKey: string, orgId?: string, userId?: string): Promise<boolean> {
    // Use the SQL function for complete logic (rollout %, org_ids, user_ids)
    const { data, error } = await this.supabase.adminClient.rpc('is_feature_enabled', {
      p_flag_key: featureKey,
      p_user_id: userId || null,
      p_org_id: orgId || null,
    });

    if (error) {
      return false;
    }

    return data === true;
  }

  /**
   * Check if multiple features are ALL enabled
   */
  async areAllEnabled(featureKeys: string[], orgId?: string, userId?: string): Promise<boolean> {
    const results = await Promise.all(featureKeys.map((key) => this.isEnabled(key, orgId, userId)));
    return results.every((enabled) => enabled);
  }

  /**
   * Check if ANY of the features are enabled
   */
  async isAnyEnabled(featureKeys: string[], orgId?: string, userId?: string): Promise<boolean> {
    const results = await Promise.all(featureKeys.map((key) => this.isEnabled(key, orgId, userId)));
    return results.some((enabled) => enabled);
  }

  /**
   * Get a feature flag by key (cached)
   */
  async getFlag(featureKey: string): Promise<FeatureFlag | null> {
    // Check cache first
    const cached = this.cache.get(featureKey);
    if (cached && cached.expires > Date.now()) {
      return cached.flag;
    }

    const { data, error } = await this.supabase.adminClient
      .from('feature_flags')
      .select('*')
      .eq('key', featureKey)
      .single();

    if (error || !data) {
      this.cache.set(featureKey, { flag: null, expires: Date.now() + this.CACHE_TTL });
      return null;
    }

    const flag = data as FeatureFlag;
    this.cache.set(featureKey, { flag, expires: Date.now() + this.CACHE_TTL });
    return flag;
  }

  /**
   * Get all feature flags (for admin dashboard)
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await this.supabase.adminClient
      .from('feature_flags')
      .select('*')
      .order('key');

    if (error) {
      return [];
    }

    return (data || []) as FeatureFlag[];
  }

  /**
   * Get feature metadata (tier, module info, etc.)
   */
  async getFeatureTier(featureKey: string): Promise<string | null> {
    const flag = await this.getFlag(featureKey);
    if (!flag?.metadata) return null;
    return (flag.metadata['tier'] as string) || null;
  }

  /**
   * Check if feature is a module flag
   */
  async isModuleFlag(featureKey: string): Promise<boolean> {
    const flag = await this.getFlag(featureKey);
    return flag?.metadata?.['module'] === true;
  }

  /**
   * Clear the cache (useful after flag updates)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
