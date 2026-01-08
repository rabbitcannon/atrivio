import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase service providing database access
 *
 * Two client types:
 * - Anonymous client: Respects RLS policies (for authenticated user operations)
 * - Service client: Bypasses RLS (for admin/system operations)
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private anonClient!: SupabaseClient;
  private serviceClient!: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Support both backend (SUPABASE_URL) and frontend (NEXT_PUBLIC_*) naming conventions
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ??
      this.configService.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_URL');
    const anonKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') ??
      this.configService.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const serviceRoleKey = this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');

    // Client that respects RLS - used with user's JWT
    this.anonClient = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Admin client that bypasses RLS - for system operations
    this.serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Get a client scoped to a user's JWT token
   * This respects RLS policies
   */
  getClientWithToken(accessToken: string): SupabaseClient {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ??
      this.configService.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_URL');
    const anonKey =
      this.configService.get<string>('SUPABASE_ANON_KEY') ??
      this.configService.getOrThrow<string>('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    return createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  /**
   * Get the anonymous client (for non-authenticated operations)
   */
  get client(): SupabaseClient {
    return this.anonClient;
  }

  /**
   * Get the service role client (bypasses RLS)
   * Use with caution - only for admin/system operations
   */
  get adminClient(): SupabaseClient {
    return this.serviceClient;
  }
}
