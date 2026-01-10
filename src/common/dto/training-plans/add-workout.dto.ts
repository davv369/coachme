import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class AddWorkoutDto {
  @ApiProperty({ description: 'Exercise ID' })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({
    description: 'Parameters customized per athlete',
    type: 'object',
    additionalProperties: true,
    example: {
      distanceKm: 15,
      pace: '05:00',
      elevationMeters: 100,
    },
  })
  @IsObject()
  @IsNotEmpty()
  parameters: Record<string, any>;

  @ApiProperty({ description: 'Scheduled workout date' })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: Date;

  @ApiProperty({
    description: 'Order in plan',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty({
    description: 'Trainer notes',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
