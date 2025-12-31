import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { CurrentUser, AccessToken } from './decorators/current-user.decorator.js';
import type { AuthUser } from './auth.service.js';
import { UpdateProfileDto, ChangePasswordDto } from './dto/users.dto.js';
import { SuperAdmin } from '../rbac/decorators/super-admin.decorator.js';

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
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @AccessToken() token: string,
    @Body() dto: ChangePasswordDto,
  ) {
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
    @Query('search') search?: string,
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
  async updateUser(
    @Param('id') id: string,
    @Body() dto: { is_super_admin?: boolean },
  ) {
    return this.usersService.updateUser(id, dto);
  }
}
