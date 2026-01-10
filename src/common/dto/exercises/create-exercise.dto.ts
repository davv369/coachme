import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsObject,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export class ExerciseParameterSchemaDto {
  @ApiProperty({ enum: ['number', 'string', 'boolean'] })
  @IsString()
  @IsNotEmpty()
  type: 'number' | 'string' | 'boolean';

  @ApiProperty({ description: 'Parameter display name' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Unit (e.g., km, min, kg)', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Minimum value', required: false })
  @IsOptional()
  min?: number;

  @ApiProperty({ description: 'Maximum value', required: false })
  @IsOptional()
  max?: number;

  @ApiProperty({
    description: 'Whether the parameter is required',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiProperty({ description: 'Default value', required: false })
  @IsOptional()
  default?: any;
}

export class ExerciseParametersTemplateDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/ExerciseParameterSchemaDto',
    },
    description: 'Schema defining available parameters',
  })
  @IsObject()
  @IsNotEmpty()
  schema: {
    [key: string]: ExerciseParameterSchemaDto;
  };

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Default parameter values',
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
