import { Injectable, Inject } from '@nestjs/common';
import {
  CreateUserRequest,
  UserWriterOutPort,
} from '../../../application/ports/out/user-writer.out-port';
import { USER_IN_PORT, UserInPort } from '@modules/users/application/ports/in/user.in-port';
import { User } from '@modules/users/domain/user.entity';

@Injectable()
export class UserWriterAdapter implements UserWriterOutPort {
  constructor(
    @Inject(USER_IN_PORT)
    private readonly userInPort: UserInPort,
  ) {}

  async createUser(request: CreateUserRequest): Promise<User> {
    const domainUser = await this.userInPort.createUser({
      email: request.email,
      password: request.password,
      name: request.name,
      role: request.role,
    });

    return {
      id: domainUser.id,
      email: domainUser.email,
      name: domainUser.name,
      passwordHash: domainUser.passwordHash,
      role: domainUser.role,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
    };
  }
}

