import { UserRole } from '../../../domain/user-role';
import { User } from '@modules/users/domain/user.entity';

export const USER_READER_OUT_PORT = Symbol('USER_READER_OUT_PORT');

export interface FindUserByEmailRequest {
  email: string;
}

export interface FindUserByRoleRequest {
  role: UserRole;
}

export interface UserReaderOutPort {
  findUserByEmail(request: FindUserByEmailRequest): Promise<User | null>;
  hasAdmin(request: FindUserByRoleRequest): Promise<boolean>;
  verifyPassword(user: User, password: string): Promise<boolean>;
}

