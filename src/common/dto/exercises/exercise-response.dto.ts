import { ApiProperty } from '@nestjs/swagger';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';
import { ExerciseParametersTemplateDto } from './create-exercise.dto';

export class ExerciseResponseDto {
  @ApiProperty({ description: 'Exercise ID' })
  id: string;

  @ApiProperty({
    description: 'Trainer ID (null = global/system exercise)',
    nullable: true,
  })
  trainerId: string | null;

  @ApiProperty({ description: 'Exercise name' })
  name: string;

  @ApiProperty({ description: 'Exercise description' })
  description: string;

  @ApiProperty({ enum: WorkoutType, description: 'Workout type' })
  workoutType: WorkoutType;

  @ApiProperty({
    type: ExerciseParametersTemplateDto,
    description: 'Exercise parameters template',
  })
  parametersTemplate: ExerciseParametersTemplateDto;

  @ApiProperty({ description: 'Whether this is a reusable template' })
  isTemplate: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
