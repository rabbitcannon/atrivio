import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { RbacModule } from '../../core/rbac/rbac.module.js';

import { StaffService } from './staff.service.js';
import { StaffController } from './staff.controller.js';
import { SkillsService } from './skills.service.js';
import { SkillsController } from './skills.controller.js';
import { CertificationsService } from './certifications.service.js';
import { CertificationsController } from './certifications.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentsController } from './documents.controller.js';
import { TimeService } from './time.service.js';
import { TimeController } from './time.controller.js';
import { WaiversService } from './waivers.service.js';
import { WaiversController } from './waivers.controller.js';

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
