import { Module } from '@nestjs/common';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { CertificationsController } from './certifications.controller.js';
import { CertificationsService } from './certifications.service.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { SkillsController } from './skills.controller.js';
import { SkillsService } from './skills.service.js';
import { StaffController } from './staff.controller.js';
import { StaffService } from './staff.service.js';
import { TimeController } from './time.controller.js';
import { TimeService } from './time.service.js';
import { WaiversController } from './waivers.controller.js';
import { WaiversService } from './waivers.service.js';

@Module({
  imports: [DatabaseModule, TenancyModule, RbacModule],
  controllers: [
    StaffController,
    SkillsController,
    CertificationsController,
    DocumentsController,
    TimeController,
    WaiversController,
  ],
  providers: [
    StaffService,
    SkillsService,
    CertificationsService,
    DocumentsService,
    TimeService,
    WaiversService,
  ],
  exports: [StaffService, TimeService],
})
export class StaffModule {}
