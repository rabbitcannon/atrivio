import { ORG_ROLES, type OrgRole } from '@atrivio/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ORG_ROLES, example: 'actor' })
  @IsEnum(ORG_ROLES)
  role!: OrgRole;
}

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  token!: string;
}
