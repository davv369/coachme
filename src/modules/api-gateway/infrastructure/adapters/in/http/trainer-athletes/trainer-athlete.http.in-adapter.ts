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
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import {
  TRAINER_ATHLETE_OUT_PORT,
  TrainerAthleteOutPort,
} from '../../../../../application/ports/out/trainer-athlete.out-port';
import { AssignAthleteDto } from '@common/dto/trainer-athletes/assign-athlete.dto';
import { TrainerAthleteResponseDto } from '@common/dto/trainer-athletes/trainer-athlete-response.dto';

@ApiTags('Trainer Athletes')
@Controller('trainer-athletes')
export class TrainerAthleteHttpInAdapter {
  private readonly logger = new Logger(TrainerAthleteHttpInAdapter.name);

  constructor(
    @Inject(TRAINER_ATHLETE_OUT_PORT)
    private readonly trainerAthleteOutPort: TrainerAthleteOutPort,
  ) {}

  @Post('assign')
  @Authenticated()
  @ApiOperation({ summary: 'Assign athlete to trainer' })
  @ApiResponse({ status: 201, type: TrainerAthleteResponseDto })
  async assignAthlete(
    @Body() dto: AssignAthleteDto,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<TrainerAthleteResponseDto> {
    this.logger.log(
      `User ${jwtPayload.email} assigning athlete ${dto.athleteId}`,
    );

    if (
      jwtPayload.role !== UserRole.TRAINER &&
      jwtPayload.role !== UserRole.ADMIN
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers and admins can assign athletes',
      );
    }

    const relationship = await this.trainerAthleteOutPort.assignAthlete({
      trainerId: jwtPayload.sub,
      athleteId: dto.athleteId,
    });

    return this.mapToDto(relationship);
  }

  @Delete('remove/:athleteId')
  @Authenticated()
  @ApiOperation({ summary: 'Remove athlete from trainer' })
  @ApiResponse({ status: 204 })
  async removeAthlete(
    @Param('athleteId') athleteId: string,
    @CurrentUser() jwtPayload: JwtPayload,
  ): Promise<void> {
    this.logger.log(`User ${jwtPayload.email} removing athlete ${athleteId}`);

    if (
      jwtPayload.role !== UserRole.TRAINER &&
      jwtPayload.role !== UserRole.ADMIN
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers and admins can remove athletes',
      );
    }

    await this.trainerAthleteOutPort.removeAthlete({
      trainerId: jwtPayload.sub,
      athleteId,
    });
  }

  @Get('my-athletes')
  @Authenticated()
  @ApiOperation({ summary: 'Get all athletes assigned to current trainer' })
  @ApiResponse({ status: 200, type: [TrainerAthleteResponseDto] })
  async getMyAthletes(
    @Query('status') status?: string,
    @CurrentUser() jwtPayload?: JwtPayload,
  ): Promise<TrainerAthleteResponseDto[]> {
    if (
      jwtPayload?.role !== UserRole.TRAINER &&
      jwtPayload?.role !== UserRole.ADMIN
    ) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only trainers and admins can list athletes',
      );
    }

    const relationships =
      await this.trainerAthleteOutPort.findAthletesByTrainer({
        trainerId: jwtPayload!.sub,
        status,
      });

    return relationships.map((r) => this.mapToDto(r));
  }

  @Get('my-trainers')
  @Authenticated()
  @ApiOperation({ summary: 'Get all trainers for current athlete' })
  @ApiResponse({ status: 200, type: [TrainerAthleteResponseDto] })
  async getMyTrainers(
    @Query('status') status?: string,
    @CurrentUser() jwtPayload?: JwtPayload,
  ): Promise<TrainerAthleteResponseDto[]> {
    if (jwtPayload?.role !== UserRole.ATHLETE) {
      throw new DomainException(
        InternalErrorCode.FORBIDDEN,
        'Only athletes can list their trainers',
      );
    }

    const relationships =
      await this.trainerAthleteOutPort.findTrainersByAthlete({
        athleteId: jwtPayload.sub,
        status,
      });

    return relationships.map((r) => this.mapToDto(r));
  }

  private mapToDto(relationship: any): TrainerAthleteResponseDto {
    return {
      id: relationship.id,
      trainerId: relationship.trainerId,
      athleteId: relationship.athleteId,
      status: relationship.status,
      startDate: relationship.startDate,
      endDate: relationship.endDate,
      createdAt: relationship.createdAt,
      updatedAt: relationship.updatedAt,
    };
  }
}
