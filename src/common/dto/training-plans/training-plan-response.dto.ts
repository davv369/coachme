import { ApiProperty } from '@nestjs/swagger';
import { TrainingPlanStatus } from '@modules/training-plans/domain/training-plan.entity';

export class TrainingPlanResponseDto {
  @ApiProperty({ description: 'Plan ID' })
  id: string;

  @ApiProperty({ description: 'Trainer ID' })
  trainerId: string;

  @ApiProperty({ description: 'Athlete ID' })
  athleteId: string;

  @ApiProperty({ description: 'Plan name' })
  name: string;

  @ApiProperty({ description: 'Plan description', nullable: true })
  description: string | null;

  @ApiProperty({ enum: TrainingPlanStatus, description: 'Plan status' })
  status: TrainingPlanStatus;

  @ApiProperty({ description: 'Start date', nullable: true })
  startDate: Date | null;

  @ApiProperty({ description: 'End date', nullable: true })
  endDate: Date | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
