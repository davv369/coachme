import { ApiProperty } from '@nestjs/swagger';

export class WorkoutResponseDto {
  @ApiProperty({ description: 'Workout ID' })
  id: string;

  @ApiProperty({ description: 'Training plan ID' })
  trainingPlanId: string;

  @ApiProperty({ description: 'Exercise ID' })
  exerciseId: string;

  @ApiProperty({
    description: 'Parameters customized per athlete',
    type: 'object',
    additionalProperties: true,
  })
  parameters: Record<string, any>;

  @ApiProperty({ description: 'Scheduled workout date' })
  scheduledDate: Date;

  @ApiProperty({ description: 'Order in plan' })
  order: number;

  @ApiProperty({ description: 'Trainer notes', nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
