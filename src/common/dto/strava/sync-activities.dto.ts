import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class SyncActivitiesDto {
  @ApiProperty({
    description: 'Sync activities after this date',
    required: false,
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  after?: string;

  @ApiProperty({
    description: 'Sync activities before this date',
    required: false,
    example: '2026-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  before?: string;
}
