import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { CreateTrainingPlanDto } from '@common/dto/training-plans/create-training-plan.dto';
import { TrainingPlanResponseDto } from '@common/dto/training-plans/training-plan-response.dto';
import { AddWorkoutDto } from '@common/dto/training-plans/add-workout.dto';
import { WorkoutResponseDto } from '@common/dto/training-plans/workout-response.dto';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import {
  TRAINING_PLAN_OUT_PORT,
  TrainingPlanOutPort,
} from '../../../../../application/ports/out/training-plan.out-port';
import { TrainingPlanStatus } from '@modules/training-plans/domain/training-plan.entity';

@ApiTags('Training Plans')
@Controller('training-plans')
export class TrainingPlanHttpInAdapter {
  private readonly logger = new Logger(TrainingPlanHttpInAdapter.name);

  constructor(
    @Inject(TRAINING_PLAN_OUT_PORT)
    private readonly trainingPlanOutPort: TrainingPlanOutPort,
  ) {}

  @Post()
  @Authenticated()
  @ApiOperation({ summary: 'Create new training plan' })
  @ApiResponse({ status: 201, type: TrainingPlanResponseDto })
  async createTrainingPlan(
    @Body() dto: CreateTrainingPlanDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainingPlanResponseDto> {
    this.logger.log(
      `User ${jwtPayload.email} creating training plan: ${dto.name}`,
    );

    if (jwtPayload.role !== UserRole.TRAINER) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers can create training plans',
      );
    }

    const plan = await this.trainingPlanOutPort.createTrainingPlan({
      trainerId: jwtPayload.sub,
      athleteId: dto.athleteId,
      name: dto.name,
      description: dto.description,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return this.mapPlanToDto(plan);
  }

  @Get(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Get training plan by ID' })
  @ApiResponse({ status: 200, type: TrainingPlanResponseDto })
  async getTrainingPlanById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainingPlanResponseDto> {
    const plan = await this.trainingPlanOutPort.findTrainingPlanById({ id });

    if (!plan) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training plan not found',
      );
    }

    if (
      jwtPayload.role !== UserRole.ADMIN &&
      plan.trainerId !== jwtPayload.sub &&
      plan.athleteId !== jwtPayload.sub
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You do not have access to this training plan',
      );
    }

    return this.mapPlanToDto(plan);
  }

  @Get()
  @Authenticated()
  @ApiOperation({ summary: 'Get list of training plans' })
  @ApiResponse({ status: 200, type: [TrainingPlanResponseDto] })
  async getTrainingPlans(
    @Query('athleteId') athleteId?: string,
    @CurrentUser() jwtPayload?: JwtPayload,
  ): Promise<TrainingPlanResponseDto[]> {
    let plans;

    if (jwtPayload?.role === UserRole.TRAINER) {
      plans = await this.trainingPlanOutPort.findTrainingPlansByTrainer({
        trainerId: jwtPayload.sub,
      });
    } else if (jwtPayload?.role === UserRole.ATHLETE) {
      plans = await this.trainingPlanOutPort.findTrainingPlansByAthlete({
        athleteId: jwtPayload.sub,
      });
    } else if (athleteId) {
      plans = await this.trainingPlanOutPort.findTrainingPlansByAthlete({
        athleteId,
      });
    } else {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Invalid query parameters',
      );
    }

    return plans.map((plan) => this.mapPlanToDto(plan));
  }

  @Patch(':id')
  @Authenticated()
  @ApiOperation({ summary: 'Update training plan' })
  @ApiResponse({ status: 200, type: TrainingPlanResponseDto })
  async updateTrainingPlan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: Partial<CreateTrainingPlanDto & { status: TrainingPlanStatus }>,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainingPlanResponseDto> {
    const plan = await this.trainingPlanOutPort.findTrainingPlanById({ id });

    if (!plan) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training plan not found',
      );
    }

    if (
      jwtPayload.role !== UserRole.ADMIN &&
      plan.trainerId !== jwtPayload.sub
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only the trainer can update this training plan',
      );
    }

    const updatedPlan = await this.trainingPlanOutPort.updateTrainingPlan({
      id,
      name: dto.name,
      description: dto.description,
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return this.mapPlanToDto(updatedPlan);
  }

  @Post(':id/workouts')
  @Authenticated()
  @ApiOperation({ summary: 'Add workout to plan' })
  @ApiResponse({ status: 201, type: WorkoutResponseDto })
  async addWorkoutToPlan(
    @Param('id', ParseUUIDPipe) trainingPlanId: string,
    @Body() dto: AddWorkoutDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<WorkoutResponseDto> {
    const plan = await this.trainingPlanOutPort.findTrainingPlanById({
      id: trainingPlanId,
    });

    if (!plan) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training plan not found',
      );
    }

    if (
      jwtPayload.role !== UserRole.ADMIN &&
      plan.trainerId !== jwtPayload.sub
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only the trainer can add workouts to this plan',
      );
    }

    const workout = await this.trainingPlanOutPort.addWorkoutToPlan({
      trainingPlanId,
      exerciseId: dto.exerciseId,
      parameters: dto.parameters,
      scheduledDate: dto.scheduledDate,
      order: dto.order,
      notes: dto.notes,
    });

    return this.mapWorkoutToDto(workout);
  }

  @Get(':id/workouts')
  @Authenticated()
  @ApiOperation({ summary: 'Get workouts from plan' })
  @ApiResponse({ status: 200, type: [WorkoutResponseDto] })
  async getWorkoutsByPlan(
    @Param('id', ParseUUIDPipe) trainingPlanId: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<WorkoutResponseDto[]> {
    const plan = await this.trainingPlanOutPort.findTrainingPlanById({
      id: trainingPlanId,
    });

    if (!plan) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training plan not found',
      );
    }

    if (
      jwtPayload.role !== UserRole.ADMIN &&
      plan.trainerId !== jwtPayload.sub &&
      plan.athleteId !== jwtPayload.sub
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'You do not have access to this training plan',
      );
    }

    const workouts = await this.trainingPlanOutPort.findWorkoutsByPlan({
      trainingPlanId,
    });

    return workouts.map((workout) => this.mapWorkoutToDto(workout));
  }

  @Delete(':id/workouts/:workoutId')
  @Authenticated()
  @ApiOperation({ summary: 'Remove workout from plan' })
  @ApiResponse({ status: 204 })
  async removeWorkoutFromPlan(
    @Param('id', ParseUUIDPipe) trainingPlanId: string,
    @Param('workoutId', ParseUUIDPipe) workoutId: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<void> {
    const plan = await this.trainingPlanOutPort.findTrainingPlanById({
      id: trainingPlanId,
    });

    if (!plan) {
      throw new DomainException(
        InternalErrorCode.NOT_FOUND,
        'Training plan not found',
      );
    }

    if (
      jwtPayload.role !== UserRole.ADMIN &&
      plan.trainerId !== jwtPayload.sub
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only the trainer can remove workouts from this plan',
      );
    }

    await this.trainingPlanOutPort.removeWorkoutFromPlan({
      id: workoutId,
      trainingPlanId,
    });
  }

  private mapPlanToDto(plan: any): TrainingPlanResponseDto {
    return {
      id: plan.id,
      trainerId: plan.trainerId,
      athleteId: plan.athleteId,
      name: plan.name,
      description: plan.description,
      status: plan.status,
      startDate: plan.startDate,
      endDate: plan.endDate,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  private mapWorkoutToDto(workout: any): WorkoutResponseDto {
    return {
      id: workout.id,
      trainingPlanId: workout.trainingPlanId,
      exerciseId: workout.exerciseId,
      parameters: workout.parameters,
      scheduledDate: workout.scheduledDate,
      order: workout.order,
      notes: workout.notes,
      createdAt: workout.createdAt,
      updatedAt: workout.updatedAt,
    };
  }
}
