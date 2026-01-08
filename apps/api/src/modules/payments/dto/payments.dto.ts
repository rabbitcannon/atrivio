import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUrl, IsUUID, Min } from 'class-validator';

export class CreateOnboardingLinkDto {
  @ApiPropertyOptional({
    example: 'https://app.haunt.dev/stripe/return',
    description: 'URL to redirect after successful onboarding',
  })
  @IsUrl()
  @IsOptional()
  return_url?: string;

  @ApiPropertyOptional({
    example: 'https://app.haunt.dev/stripe/refresh',
    description: 'URL to redirect if link expires',
  })
  @IsUrl()
  @IsOptional()
  refresh_url?: string;
}

export class CreateDashboardLinkDto {
  @ApiPropertyOptional({
    example: 'https://app.haunt.dev/settings/payments',
    description: 'URL to redirect when exiting dashboard',
  })
  @IsUrl()
  @IsOptional()
  return_url?: string;
}

export class ListTransactionsDto {
  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date filter' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'End date filter' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({
    example: 'charge',
    enum: ['charge', 'refund', 'transfer', 'payout', 'fee', 'adjustment'],
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    example: 'succeeded',
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'disputed'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 20, description: 'Number of items per page' })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of items to skip' })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

export class ListPayoutsDto {
  @ApiPropertyOptional({
    example: 'paid',
    enum: ['pending', 'in_transit', 'paid', 'failed', 'canceled'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 20, description: 'Number of items per page' })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Number of items to skip' })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}

export class CreateRefundDto {
  @ApiProperty({ description: 'Transaction ID to refund' })
  @IsUUID()
  transaction_id!: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Partial refund amount in cents (omit for full refund)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'Customer requested refund' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// Response DTOs
export class StripeAccountStatusDto {
  @ApiProperty({ example: true })
  is_connected!: boolean;

  @ApiProperty({
    example: 'active',
    enum: ['pending', 'onboarding', 'active', 'restricted', 'disabled'],
  })
  status!: string;

  @ApiProperty({ example: true })
  charges_enabled!: boolean;

  @ApiProperty({ example: true })
  payouts_enabled!: boolean;

  @ApiProperty({ example: false })
  needs_onboarding!: boolean;

  @ApiPropertyOptional({ example: 'acct_1234567890' })
  stripe_account_id?: string;

  @ApiPropertyOptional({ example: 'Nightmare Manor' })
  business_name?: string;
}

export class TransactionSummaryDto {
  @ApiProperty({ example: 50000, description: 'Total charges in cents' })
  total_charges!: number;

  @ApiProperty({ example: 2500, description: 'Total refunds in cents' })
  total_refunds!: number;

  @ApiProperty({ example: 1450, description: 'Total fees in cents' })
  total_fees!: number;

  @ApiProperty({ example: 46050, description: 'Net revenue in cents' })
  net_revenue!: number;

  @ApiProperty({ example: 25 })
  transaction_count!: number;
}

export class OnboardingLinkResponseDto {
  @ApiProperty({ example: 'https://connect.stripe.com/setup/e/...' })
  url!: string;

  @ApiProperty({ example: '2024-01-01T12:00:00Z' })
  expires_at!: string;
}

export class DashboardLinkResponseDto {
  @ApiProperty({ example: 'https://connect.stripe.com/express/...' })
  url!: string;
}
