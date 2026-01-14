import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import { SubscriptionsService } from './subscriptions.service.js';

/**
 * Public pricing endpoint for landing page and unauthenticated users
 */
@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
  constructor(private subscriptions: SubscriptionsService) {}

  @Get('tiers')
  @Public()
  @ApiOperation({ summary: 'Get public subscription tier information' })
  @ApiResponse({ status: 200, description: 'Subscription tiers retrieved' })
  async getTiers() {
    const tiers = await this.subscriptions.getAllTierConfigs();

    return {
      tiers: tiers.map((tier) => ({
        tier: tier.tier,
        name: tier.name,
        description: tier.description,
        monthlyPriceCents: tier.monthlyPriceCents,
        monthlyPrice: tier.monthlyPriceCents === 0 ? '$0' : `$${(tier.monthlyPriceCents / 100).toFixed(0)}`,
        transactionFeePercentage: tier.transactionFeePercentage,
        transactionFeeFixedCents: tier.transactionFeeFixedCents,
        transactionFee: `${tier.transactionFeePercentage}% + $${(tier.transactionFeeFixedCents / 100).toFixed(2)}`,
        limits: {
          attractions: tier.attractionsLimit,
          staffMembers: tier.staffMembersLimit,
          customDomains: tier.customDomainsLimit,
        },
        features: tier.features,
        isActive: tier.isActive,
      })),
    };
  }
}
