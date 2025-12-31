import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../../../shared/database/supabase.service.js';

/**
 * Guard that requires the user to be a super admin (is_super_admin = true in profiles)
 * Must be used after authentication middleware has set the user
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new ForbiddenException({
        code: 'ADMIN_REQUIRED',
        message: 'Authentication required',
      });
    }

    // Check if user is super admin using service client (bypasses RLS)
    const { data: profile, error } = await this.supabase.adminClient
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (error || !profile?.is_super_admin) {
      throw new ForbiddenException({
        code: 'ADMIN_REQUIRED',
        message: 'Super admin access required',
      });
    }

    // Attach super admin flag to request
    request.isSuperAdmin = true;

    return true;
  }
}
