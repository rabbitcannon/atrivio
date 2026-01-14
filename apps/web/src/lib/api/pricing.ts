/**
 * Public Pricing API - No authentication required
 * Fetches subscription tier pricing from the database
 */

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

export interface PricingTier {
  tier: 'free' | 'pro' | 'enterprise';
  name: string;
  description: string;
  monthlyPriceCents: number;
  monthlyPrice: string;
  transactionFeePercentage: number;
  transactionFeeFixedCents: number;
  transactionFee: string;
  limits: {
    attractions: number;
    staffMembers: number;
    customDomains: number;
  };
  features: string[];
  isActive: boolean;
}

export interface PricingResponse {
  tiers: PricingTier[];
}

/**
 * Fetch public pricing tiers from the API
 * This endpoint doesn't require authentication
 */
export async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/tiers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't cache pricing data - always fetch fresh for accuracy
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch pricing tiers:', response.status);
      return [];
    }

    const data: PricingResponse = await response.json();
    return data.tiers;
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return [];
  }
}

/**
 * Get a specific tier's pricing info
 */
export async function getTierPricing(tier: 'free' | 'pro' | 'enterprise'): Promise<PricingTier | null> {
  const tiers = await getPricingTiers();
  return tiers.find((t) => t.tier === tier) || null;
}
