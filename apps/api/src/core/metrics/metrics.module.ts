import { Global, Module } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import { MetricsInterceptor } from './metrics.interceptor.js';

/**
 * Global metrics module for request tracking
 * Provides MetricsService and MetricsInterceptor
 */
@Global()
@Module({
  providers: [MetricsService, MetricsInterceptor],
  exports: [MetricsService, MetricsInterceptor],
})
export class MetricsModule {}
