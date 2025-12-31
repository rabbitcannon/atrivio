import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
  IsObject,
  IsArray,
  IsBoolean,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

const STAFF_STATUS = ['active', 'inactive', 'on_leave', 'terminated'] as const;
type StaffStatus = (typeof STAFF_STATUS)[number];

const EMPLOYMENT_TYPE = ['full_time', 'part_time', 'seasonal', 'contractor'] as const;
type EmploymentType = (typeof EMPLOYMENT_TYPE)[number];

export class EmergencyContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '+1987654321' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsString()
  @IsOptional()
  relation?: string;
}

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'EMP001' })
  @IsString()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({ enum: STAFF_STATUS, example: 'active' })
  @IsEnum(STAFF_STATUS)
  @IsOptional()
  status?: StaffStatus;

  @ApiPropertyOptional({ enum: EMPLOYMENT_TYPE, example: 'seasonal' })
  @IsEnum(EMPLOYMENT_TYPE)
  @IsOptional()
  employment_type?: EmploymentType;

  @ApiPropertyOptional({ example: 1750, description: 'Hourly rate in cents' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  hourly_rate?: number;

  @ApiPropertyOptional({ example: 'L' })
  @IsString()
  @IsOptional()
  shirt_size?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergency_contact?: EmergencyContactDto;

  @ApiPropertyOptional({ example: 'Updated notes about this staff member' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class TerminateStaffDto {
  @ApiProperty({ example: '2024-11-15' })
  @IsDateString()
  termination_date!: string;

  @ApiPropertyOptional({ example: 'End of season' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'Eligible for rehire' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AttractionAssignmentDto {
  @ApiProperty({ example: 'attraction-uuid' })
  @IsString()
  attraction_id!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_primary!: boolean;

  @ApiPropertyOptional({ example: ['zone-uuid-1', 'zone-uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  zones?: string[];
}

export class UpdateAssignmentsDto {
  @ApiProperty({ type: [AttractionAssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttractionAssignmentDto)
  assignments!: AttractionAssignmentDto[];
}

export class StaffQueryDto {
  @ApiPropertyOptional({ enum: STAFF_STATUS })
  @IsEnum(STAFF_STATUS)
  @IsOptional()
  status?: StaffStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  attraction_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  skill?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Find staff with certs expiring in N days' })
  @IsNumber()
  @IsOptional()
  certification_expiring_days?: number;
}
