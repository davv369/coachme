import {
  Body,
  Controller,
  Delete,
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
  @ApiOperation({ summary: 'Create new exercise' })
  @ApiResponse({ status: 201, type: ExerciseResponseDto })
  async createExercise(
    @Body() dto: CreateExerciseDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<ExerciseResponseDto> {
    this.logger.log(`User ${jwtPayload.email} creating exercise: ${dto.name}`);

    if (
      jwtPayload.role !== UserRole.TRAINER &&
      jwtPayload.role !== UserRole.ADMIN
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers and admins can create exercises',
      );
    }

    // Admin can create global exercises (trainerId = null), trainers create their own
    const trainerId =
      jwtPayload.role === UserRole.ADMIN ? null : jwtPayload.sub;

    const exercise = await this.exerciseOutPort.createExercise({
      trainerId,
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
  @ApiOperation({ summary: 'Get exercise by ID' })
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
  @ApiOperation({ summary: 'Get list of exercises' })
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

  @Delete(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Delete exercise' })
  @ApiResponse({ status: 204 })
  async deleteExercise(
    @Param('id') id: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<void> {
    this.logger.log(`User ${jwtPayload.email} deleting exercise: ${id}`);

    if (
      jwtPayload.role !== UserRole.TRAINER &&
      jwtPayload.role !== UserRole.ADMIN
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers and admins can delete exercises',
      );
    }

    const exercise = await this.exerciseOutPort.findExerciseById({ id });

    if (!exercise) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Exercise not found',
      );
    }

    // Only trainer who created the exercise can delete it
    // For global exercises (trainerId === null), only admin can delete
    if (
      jwtPayload.role !== UserRole.ADMIN &&
      (exercise.trainerId === null || exercise.trainerId !== jwtPayload.sub)
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You can only delete your own exercises',
      );
    }

    // For global exercises, pass null as trainerId; for trainer's exercises, pass their ID
    const trainerIdForDelete =
      exercise.trainerId === null ? null : jwtPayload.sub;

    await this.exerciseOutPort.deleteExercise({
      id,
      trainerId: trainerIdForDelete,
    });
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
