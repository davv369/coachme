import { Injectable, Inject } from '@nestjs/common';
import { User } from '@modules/users/domain/user.entity';
import {
  FindUserByEmailRequest,
  FindUserByRoleRequest,
  UserReaderOutPort,
} from '../../../application/ports/out/user-reader.out-port';
import { USER_IN_PORT, UserInPort } from '@modules/users/application/ports/in/user.in-port';

@Injectable()
export class UserReaderAdapter implements UserReaderOutPort {
  constructor(
    @Inject(USER_IN_PORT)
    private readonly userInPort: UserInPort,
  ) {}

  async findUserByEmail(request: FindUserByEmailRequest): Promise<User | null> {
    const user = await this.userInPort.findUserByEmail({ email: request.email });
    if (!user) {
      return null;
    }
    return this.mapToUser(user);
  }

  async hasAdmin(request: FindUserByRoleRequest): Promise<boolean> {
    return this.userInPort.hasAdmin({ role: request.role });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    const domainUser = await this.userInPort.findUserByEmail({
      email: user.email,
    });
    if (!domainUser) {
      return false;
    }
    return this.userInPort.verifyPassword(domainUser, password);
  }

  private mapToUser(domainUser: any): User {
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

