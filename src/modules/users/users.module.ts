import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './application/services/user.service';
import { USER_IN_PORT } from './application/ports/in/user.in-port';
import { UserDatabaseModule } from './infrastructure/adapters/out/persistence/database/user.database.module';
import { AuthModule } from '@auth/auth.module';
import { UserHttpInAdapter } from './infrastructure/adapters/in/http/user.http.in-adapter';

@Module({
  imports: [UserDatabaseModule, forwardRef(() => AuthModule)],
  controllers: [UserHttpInAdapter],
  providers: [
    {
      provide: USER_IN_PORT,
      useClass: UserService,
    },
  ],
  exports: [USER_IN_PORT],
})
export class UsersModule {}
