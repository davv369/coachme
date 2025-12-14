import { User } from '../../../domain/user.entity';
import { UserRole } from '@modules/auth/domain/user-role';

export const USER_REPOSITORY_OUT_PORT = Symbol('USER_REPOSITORY_OUT_PORT');

export interface CreateUserRequest {
  email: string;
  name: string;
  passwordHash: string;
  role: string;
}

export interface FindByEmailRequest {
  email: string;
}

export interface FindByRoleRequest {
  role: UserRole;
}

export interface FindByIdRequest {
  id: string;
}

export interface UserRepositoryOutPort {
  create(request: CreateUserRequest): Promise<User>;
  findByEmail(request: FindByEmailRequest): Promise<User | null>;
  findById(request: FindByIdRequest): Promise<User | null>;
  findByRole(request: FindByRoleRequest): Promise<User | null>;
}

