import { Injectable } from '@nestjs/common';
import { UserRole } from '@modules/auth/domain/user-role';
import { User } from '../../../../../domain/user.entity';
import {
  CreateUserRequest,
  FindByEmailRequest,
  FindByIdRequest,
  FindByRoleRequest,
  UserRepositoryOutPort,
} from '../../../../../application/ports/out/user-repository.out-port';
import { Knex } from 'knex';
import { randomUUID } from 'crypto';

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UserDatabaseRepository implements UserRepositoryOutPort {
  private readonly tableName = 'users';

  constructor(private readonly knex: Knex) {}

  async create(request: CreateUserRequest): Promise<User> {
    const now = new Date();
    const id = randomUUID();

    const [userRow] = await this.knex<UserRow>(this.tableName)
      .insert({
        id,
        email: request.email,
        name: request.name,
        password_hash: request.passwordHash,
        role: request.role,
        created_at: now,
        updated_at: now,
      })
      .returning('*');

    return this.mapToUser(userRow);
  }

  async findByEmail(request: FindByEmailRequest): Promise<User | null> {
    const userRow = await this.knex<UserRow>(this.tableName)
      .where({ email: request.email })
      .first();

    return userRow ? this.mapToUser(userRow) : null;
  }

  async findById(request: FindByIdRequest): Promise<User | null> {
    const userRow = await this.knex<UserRow>(this.tableName)
      .where({ id: request.id })
      .first();

    return userRow ? this.mapToUser(userRow) : null;
  }

  async findByRole(request: FindByRoleRequest): Promise<User | null> {
    const userRow = await this.knex<UserRow>(this.tableName)
      .where({ role: request.role })
      .first();

    return userRow ? this.mapToUser(userRow) : null;
  }

  private mapToUser(row: UserRow): User {
    return new User(
      row.id,
      row.email,
      row.name,
      row.password_hash,
      row.role as UserRole,
      row.created_at,
      row.updated_at,
    );
  }
}
