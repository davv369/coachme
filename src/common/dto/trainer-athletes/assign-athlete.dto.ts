import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignAthleteDto {
  @ApiProperty({
    description: 'Athlete ID to assign to trainer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  athleteId: string;
}
