import { ApiProperty } from '@nestjs/swagger';
import { TrainerAthleteStatus } from '@modules/trainer-athletes/domain/trainer-athlete-status.enum';

export class TrainerAthleteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  trainerId: string;

  @ApiProperty()
  athleteId: string;

  @ApiProperty({ enum: TrainerAthleteStatus })
  status: TrainerAthleteStatus;

  @ApiProperty()
  startDate: Date;

  @ApiProperty({ nullable: true })
  endDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
