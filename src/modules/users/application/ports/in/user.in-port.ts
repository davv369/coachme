import { User } from '../../../domain/user.entity';
import { UserRole } from '@modules/auth/domain/user-role';

export const USER_IN_PORT = Symbol('USER_IN_PORT');

export interface CreateUserCommand {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface FindUserByEmailQuery {
  email: string;
}

export interface HasAdminQuery {
  role: UserRole;
}

export interface UserInPort {
  createUser(command: CreateUserCommand): Promise<User>;
  findUserByEmail(query: FindUserByEmailQuery): Promise<User | null>;
  verifyPassword(user: User, password: string): Promise<boolean>;
  hasAdmin(query: HasAdminQuery): Promise<boolean>;
}

