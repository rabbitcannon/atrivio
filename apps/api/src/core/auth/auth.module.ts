import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { DatabaseModule } from '../../shared/database/database.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [DatabaseModule, RbacModule],
  controllers: [AuthController, UsersController],
  providers: [
    AuthService,
    UsersService,
    // Global guard - all routes require auth by default
    // Use @Public() decorator to opt out
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
