import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export class ExerciseParametersTemplateDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description:
      'Default parameter values (e.g. steps). No schema – FE knows structure per workoutType.',
  })
  @IsObject()
  @IsNotEmpty()
  defaults: Record<string, any>;
}

export class CreateExerciseDto {
  @ApiProperty({
    description: 'Trainer ID (null = global/system exercise)',
    required: false,
    nullable: true,
  })
  @IsOptional()
  trainerId?: string | null;

  @ApiProperty({ description: 'Exercise name', example: 'Long run' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Exercise description',
    example: 'Steady long-distance run in aerobic zone',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: WorkoutType,
    description: 'Workout type',
    example: WorkoutType.RUNNING,
  })
  @IsEnum(WorkoutType)
  @IsNotEmpty()
  workoutType: WorkoutType;

  @ApiProperty({
    type: ExerciseParametersTemplateDto,
    description: 'Exercise parameters template',
  })
  @ValidateNested()
  @Type(() => ExerciseParametersTemplateDto)
  @IsObject()
  @IsNotEmpty()
  parametersTemplate: ExerciseParametersTemplateDto;

  @ApiProperty({
    description: 'Whether this is a reusable template',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;
}
