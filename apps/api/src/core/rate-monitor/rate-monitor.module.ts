import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { RateMonitorInterceptor } from './rate-monitor.interceptor.js';
import { RateMonitorService } from './rate-monitor.service.js';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [RateMonitorService, RateMonitorInterceptor],
  exports: [RateMonitorService, RateMonitorInterceptor],
})
export class RateMonitorModule {}
