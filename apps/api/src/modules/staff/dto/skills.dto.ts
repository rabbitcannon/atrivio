import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class AddSkillDto {
  @ApiProperty({ example: 'sfx_makeup' })
  @IsString()
  skill!: string;

  @ApiProperty({ example: 3, description: 'Skill level 1-5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  level!: number;

  @ApiPropertyOptional({ example: 'Completed advanced workshop' })
  @IsString()
  @IsOptional()
  notes?: string;
}
