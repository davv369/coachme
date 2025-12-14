import { UserRole } from '@modules/auth/domain/user-role';
import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.TRAINER,
  })
  role: UserRole;
}

