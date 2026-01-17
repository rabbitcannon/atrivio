import type { UserId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  ForgotPasswordDto,
  LoginDto,
  MagicLinkDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto.js';

export interface AuthUser {
  id: UserId;
  email: string;
  emailVerified: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private audit: AuditService
  ) {}

  /**
   * Register a new user with email and password
   */
  async register(dto: RegisterDto) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw new ConflictException({
          code: 'AUTH_EMAIL_EXISTS',
          message: 'Email is already registered',
        });
      }
      throw new BadRequestException({
        code: 'AUTH_REGISTRATION_FAILED',
        message: error.message,
      });
    }

    // Log audit event for user registration
    if (data.user?.id) {
      await this.audit.log({
        actorId: data.user.id as UserId,
        action: 'user.registered',
        resourceType: 'user',
        resourceId: data.user.id,
        metadata: {
          email: data.user.email,
          first_name: dto.first_name,
          last_name: dto.last_name,
        },
      });
    }

    return {
      user: {
        id: data.user?.id,
        email: data.user?.email,
        email_verified: false,
      },
      message: 'Confirmation email sent',
    };
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      if (error.message.includes('Invalid login')) {
        throw new UnauthorizedException({
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }
      if (error.message.includes('Email not confirmed')) {
        throw new UnauthorizedException({
          code: 'AUTH_EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in',
        });
      }
      throw new UnauthorizedException({
        code: 'AUTH_LOGIN_FAILED',
        message: error.message,
      });
    }

    // Get profile data
    const { data: profile } = await this.supabase.adminClient
      .from('profiles')
      .select('first_name, last_name, display_name, avatar_url')
      .eq('id', data.user.id)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile || {
          first_name: null,
          last_name: null,
          display_name: null,
          avatar_url: null,
        },
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  /**
   * Send magic link for passwordless authentication
   */
  async sendMagicLink(dto: MagicLinkDto) {
    const { error } = await this.supabase.client.auth.signInWithOtp({
      email: dto.email,
    });

    if (error) {
      throw new BadRequestException({
        code: 'AUTH_MAGIC_LINK_FAILED',
        message: error.message,
      });
    }

    return { message: 'Magic link sent to email' };
  }

  /**
   * Logout - invalidate current session
   */
  async logout(accessToken: string) {
    const client = this.supabase.getClientWithToken(accessToken);
    const { error } = await client.auth.signOut();

    if (error) {
      throw new BadRequestException({
        code: 'AUTH_LOGOUT_FAILED',
        message: error.message,
      });
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(dto: RefreshTokenDto) {
    const { data, error } = await this.supabase.client.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid or expired refresh token',
      });
    }

    return {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(dto.email);

    if (error) {
    }

    // Always return success to prevent email enumeration
    return { message: 'Password reset email sent' };
  }

  /**
   * Complete password reset with token
   */
  async resetPassword(dto: ResetPasswordDto) {
    // The token is used via the Supabase auth callback URL
    // This endpoint handles the final password update
    const { error } = await this.supabase.client.auth.updateUser({
      password: dto.password,
    });

    if (error) {
      throw new BadRequestException({
        code: 'AUTH_RESET_FAILED',
        message: error.message,
      });
    }

    return { message: 'Password reset successfully' };
  }

  /**
   * Validate a JWT token and return the user
   */
  async validateToken(accessToken: string): Promise<AuthUser> {
    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid or expired token',
      });
    }

    return {
      id: user.id as UserId,
      email: user.email || '',
      emailVerified: user.email_confirmed_at !== null,
    };
  }
}
