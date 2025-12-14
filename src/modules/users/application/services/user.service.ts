import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import {
  CreateUserCommand,
  FindUserByEmailQuery,
  HasAdminQuery,
  USER_IN_PORT,
  UserInPort,
} from '../ports/in/user.in-port';
import {
  USER_REPOSITORY_OUT_PORT,
  UserRepositoryOutPort,
} from '../ports/out/user-repository.out-port';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService implements UserInPort {
  constructor(
    @Inject(USER_REPOSITORY_OUT_PORT)
    private readonly userRepository: UserRepositoryOutPort,
  ) {}

  async createUser(command: CreateUserCommand): Promise<User> {
    const passwordHash = await bcrypt.hash(command.password, 10);

    return this.userRepository.create({
      email: command.email,
      name: command.name,
      passwordHash,
      role: command.role,
    });
  }

  async findUserByEmail(query: FindUserByEmailQuery): Promise<User | null> {
    return this.userRepository.findByEmail({ email: query.email });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async hasAdmin(query: HasAdminQuery): Promise<boolean> {
    const admin = await this.userRepository.findByRole({ role: query.role });
    return admin !== null;
  }
}

