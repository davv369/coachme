import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateTrainingPlanDto {
  @ApiProperty({ description: 'Athlete ID' })
  @IsString()
  @IsNotEmpty()
  athleteId: string;

  @ApiProperty({ description: 'Plan name', example: 'Marathon preparation' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    required: false,
    nullable: true,
    example: '12-week preparation plan before marathon',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    description: 'Plan start date',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date | null;

  @ApiProperty({
    description: 'Plan end date',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date | null;
}
