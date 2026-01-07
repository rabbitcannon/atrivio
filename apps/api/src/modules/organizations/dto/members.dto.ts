import { ORG_ROLES, type OrgRole } from '@haunt/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateMemberDto {
  @ApiProperty({ enum: ORG_ROLES, example: 'manager' })
  @IsEnum(ORG_ROLES)
  role!: OrgRole;
}
