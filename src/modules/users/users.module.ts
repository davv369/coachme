import { Module } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { USER_IN_PORT } from './application/ports/in/user.in-port';
import { USER_REPOSITORY_OUT_PORT } from './application/ports/out/user-repository.out-port';
import { UserInMemoryRepository } from './infrastructure/adapters/out/persistence/in-memory/user.in-memory.repository';

@Module({
  providers: [
    {
      provide: USER_IN_PORT,
      useClass: UserService,
    },
    {
      provide: USER_REPOSITORY_OUT_PORT,
      useClass: UserInMemoryRepository,
    },
  ],
  exports: [USER_IN_PORT],
})
export class UsersModule {}
