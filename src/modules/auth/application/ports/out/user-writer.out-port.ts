import { UserRole } from '../../../domain/user-role';
import { User } from '@modules/users/domain/user.entity';

export const USER_WRITER_OUT_PORT = Symbol('USER_WRITER_OUT_PORT');

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UserWriterOutPort {
  createUser(request: CreateUserRequest): Promise<User>;
}

