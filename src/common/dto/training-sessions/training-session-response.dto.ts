import { ApiProperty } from '@nestjs/swagger';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

export class TrainingSessionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  athleteId: string;

  @ApiProperty({ enum: WorkoutType })
  workoutType: WorkoutType;

  @ApiProperty()
  actualDate: Date;

  @ApiProperty()
  actualParameters: Record<string, any>;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ nullable: true })
  trainingPlanId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
