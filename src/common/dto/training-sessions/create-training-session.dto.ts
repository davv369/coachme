import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsObject,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export class CreateTrainingSessionDto {
  @ApiProperty({
    description: 'Type of workout performed',
    enum: WorkoutType,
    example: WorkoutType.RUNNING,
  })
  @IsEnum(WorkoutType)
  @IsNotEmpty()
  workoutType: WorkoutType;

  @ApiProperty({
    description: 'Date when the session was performed',
    example: '2026-01-10T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  actualDate: string;

  @ApiProperty({
    description: 'Actual parameters/results from the session',
    example: {
      distanceKm: 10,
      pace: '05:30',
      elevationMeters: 100,
    },
  })
  @IsObject()
  @IsNotEmpty()
  actualParameters: Record<string, any>;

  @ApiProperty({
    description: 'Athlete notes about the session',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @ApiProperty({
    description: 'Optional: Link to training plan (for statistics purposes)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  trainingPlanId?: string | null;
}
