import { Module } from '@nestjs/common';
import { RbacModule } from '../../core/rbac/rbac.module.js';
import { TenancyModule } from '../../core/tenancy/tenancy.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { InvitationsController } from './invitations.controller.js';
import { InvitationsService } from './invitations.service.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';

@Module({
  imports: [TenancyModule, RbacModule, NotificationsModule, PaymentsModule],
  controllers: [OrganizationsController, MembersController, InvitationsController],
  providers: [OrganizationsService, MembersService, InvitationsService],
  exports: [OrganizationsService, MembersService, InvitationsService],
})
export class OrganizationsModule {}
