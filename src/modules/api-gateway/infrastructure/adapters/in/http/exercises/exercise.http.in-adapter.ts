import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Logger } from '@common/logger/logger';
import {
  Authenticated,
  CurrentUser,
} from '@modules/auth/application/decorators';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';
import { UserRole } from '@modules/auth/domain/user-role';
import { CreateExerciseDto } from '@common/dto/exercises/create-exercise.dto';
import { ExerciseResponseDto } from '@common/dto/exercises/exercise-response.dto';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import {
  EXERCISE_OUT_PORT,
  ExerciseOutPort,
} from '../../../../../application/ports/out/exercise.out-port';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

@ApiTags('Exercises')
@Controller('exercises')
export class ExerciseHttpInAdapter {
  private readonly logger = new Logger(ExerciseHttpInAdapter.name);

  constructor(
    @Inject(EXERCISE_OUT_PORT)
    private readonly exerciseOutPort: ExerciseOutPort,
  ) {}

  @Post()
  @Authenticated()
  @ApiOperation({ summary: 'Utwórz nowe ćwiczenie' })
  @ApiResponse({ status: 201, type: ExerciseResponseDto })
  async createExercise(
    @Body() dto: CreateExerciseDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<ExerciseResponseDto> {
    this.logger.log(`User ${jwtPayload.email} creating exercise: ${dto.name}`);

    if (jwtPayload.role !== UserRole.TRAINER) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers can create exercises',
      );
    }

    const exercise = await this.exerciseOutPort.createExercise({
      trainerId: jwtPayload.sub,
      name: dto.name,
      description: dto.description,
      workoutType: dto.workoutType,
      parametersTemplate: dto.parametersTemplate,
      isTemplate: dto.isTemplate ?? true,
    });

    return this.mapExerciseToDto(exercise);
  }

  @Get(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Pobierz ćwiczenie po ID' })
  @ApiResponse({ status: 200, type: ExerciseResponseDto })
  async getExerciseById(@Param('id') id: string): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseOutPort.findExerciseById({ id });

    if (!exercise) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Exercise not found',
      );
    }

    return this.mapExerciseToDto(exercise);
  }

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Pobierz listę ćwiczeń' })
  @ApiResponse({ status: 200, type: [ExerciseResponseDto] })
  async getExercises(
    @Query('trainerId') trainerId?: string | null,
    @Query('workoutType') workoutType?: WorkoutType,
    @CurrentUser() jwtPayload?: JwtPayload,
  ): Promise<ExerciseResponseDto[]> {
    let exercises;

    if (workoutType) {
      exercises = await this.exerciseOutPort.findExercisesByWorkoutType({
        workoutType,
        trainerId: trainerId === 'null' ? null : trainerId || undefined,
      });
    } else if (trainerId !== undefined) {
      exercises = await this.exerciseOutPort.findExercisesByTrainer({
        trainerId: trainerId === 'null' ? null : trainerId,
      });
    } else {
      exercises = await this.exerciseOutPort.findExercisesByTrainer({
        trainerId: jwtPayload?.sub || null,
      });
    }

    return exercises.map((exercise) => this.mapExerciseToDto(exercise));
  }

  private mapExerciseToDto(exercise: any): ExerciseResponseDto {
    return {
      id: exercise.id,
      trainerId: exercise.trainerId,
      name: exercise.name,
      description: exercise.description,
      workoutType: exercise.workoutType,
      parametersTemplate: exercise.parametersTemplate,
      isTemplate: exercise.isTemplate,
      createdAt: exercise.createdAt,
      updatedAt: exercise.updatedAt,
    };
  }
}
