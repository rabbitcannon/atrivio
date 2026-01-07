import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuperAdmin } from '../rbac/decorators/super-admin.decorator.js';
import type { AuthUser } from './auth.service.js';
import { AccessToken, CurrentUser } from './decorators/current-user.decorator.js';
import type { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: AuthUser, @AccessToken() token: string) {
    return this.usersService.getProfile(user.id, token);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@AccessToken() token: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(token, dto);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remove profile avatar' })
  async deleteAvatar(@CurrentUser() user: AuthUser) {
    return this.usersService.removeAvatar(user.id);
  }

  // Super Admin endpoints

  @Get()
  @SuperAdmin()
  @ApiOperation({ summary: 'List all users (super admin only)' })
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string
  ) {
    return this.usersService.listUsers({
      page,
      limit,
      ...(search !== undefined && { search }),
    });
  }

  @Get(':id')
  @SuperAdmin()
  @ApiOperation({ summary: 'Get user by ID (super admin only)' })
  async getUser(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  @SuperAdmin()
  @ApiOperation({ summary: 'Update user (super admin only)' })
  async updateUser(@Param('id') id: string, @Body() dto: { is_super_admin?: boolean }) {
    return this.usersService.updateUser(id, dto);
  }
}
