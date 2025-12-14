import { Injectable } from '@nestjs/common';
import { User } from '../../../../../domain/user.entity';
import {
  CreateUserRequest,
  FindByEmailRequest,
  FindByIdRequest,
  FindByRoleRequest,
  UserRepositoryOutPort,
} from '../../../../../application/ports/out/user-repository.out-port';
import { randomUUID } from 'crypto';

@Injectable()
export class UserInMemoryRepository implements UserRepositoryOutPort {
  private readonly users: Map<string, User> = new Map();

  async create(request: CreateUserRequest): Promise<User> {
    const now = new Date();
    const user = new User(
      randomUUID(),
      request.email,
      request.name,
      request.passwordHash,
      request.role as any,
      now,
      now,
    );

    this.users.set(user.id, user);
    return user;
  }

  async findByEmail(request: FindByEmailRequest): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === request.email) {
        return user;
      }
    }
    return null;
  }

  async findById(request: FindByIdRequest): Promise<User | null> {
    return this.users.get(request.id) || null;
  }

  async findByRole(request: FindByRoleRequest): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.role === request.role) {
        return user;
      }
    }
    return null;
  }
}

