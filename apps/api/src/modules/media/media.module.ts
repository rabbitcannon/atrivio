import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../core/features/features.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { StorageModule } from '../../shared/storage/storage.module.js';
import { MediaController } from './media.controller.js';
import { MediaRepository } from './media.repository.js';
import { MediaService } from './media.service.js';

@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    TenancyModule,
    RbacModule,
    FeaturesModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
  exports: [MediaService],
})
export class MediaModule {}
