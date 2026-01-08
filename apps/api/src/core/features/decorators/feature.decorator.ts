import { SetMetadata } from '@nestjs/common';

export const FEATURE_KEY = 'feature_flag';

/**
 * Decorator to specify required feature flag(s) for a route or controller
 *
 * @example
 * // Single feature
 * @Feature('scheduling')
 * @Controller('schedules')
 * export class SchedulingController {}
 *
 * @example
 * // Multiple features (requires ALL to be enabled)
 * @Feature('ticketing', 'checkin')
 * @Post('scan')
 * scanTicket() {}
 */
export const Feature = (...features: string[]) => SetMetadata(FEATURE_KEY, features);
