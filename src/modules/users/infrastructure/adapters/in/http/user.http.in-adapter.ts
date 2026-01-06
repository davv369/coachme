import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Logger } from '@common/logger/logger';
import {
  Authenticated,
  CurrentUser,
} from '@modules/auth/application/decorators';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';

import { MeResponseDto } from '@common/dto/users/me.dto';
import { DomainException } from '@common/error-handling/domain.exception';
import { InternalErrorCode } from '@common/error-handling/internal-error-code';
import {
  USER_IN_PORT,
  UserInPort,
} from '@modules/users/application/ports/in/user.in-port';

@ApiTags('Users')
@Controller('users')
export class UserHttpInAdapter {
  private readonly logger = new Logger(UserHttpInAdapter.name);

  constructor(
    @Inject(USER_IN_PORT)
    private readonly userInPort: UserInPort,
  ) {}

  @Get('me')
  @Authenticated()
  async getMe(@CurrentUser() jwtPayload: JwtPayload): Promise<MeResponseDto> {
    this.logger.log(`User ${jwtPayload.email} accessed /users/me endpoint`);

    const user = await this.userInPort.findUserById({ id: jwtPayload.sub });

    if (!user) {
      throw new DomainException(InternalErrorCode.NOT_FOUND, 'User not found');
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
