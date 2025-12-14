import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './application/services/jwt.service';
import { AuthGuard } from './infrastructure/guards/auth.guard';
import { AuthService } from './application/services/auth.service';
import { AUTH_IN_PORT } from './application/ports/in/auth.in-port';
import { JWT_GENERATOR_OUT_PORT } from './application/ports/out/jwt-generator.out-port';
import { USER_READER_OUT_PORT } from './application/ports/out/user-reader.out-port';
import { USER_WRITER_OUT_PORT } from './application/ports/out/user-writer.out-port';
import { JwtGeneratorAdapter } from './infrastructure/adapters/out/jwt-generator.adapter';
import { UserReaderAdapter } from './infrastructure/adapters/out/user-reader.adapter';
import { UserWriterAdapter } from './infrastructure/adapters/out/user-writer.adapter';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [
    JwtService,
    AuthGuard,
    {
      provide: JWT_GENERATOR_OUT_PORT,
      useClass: JwtGeneratorAdapter,
    },
    {
      provide: USER_READER_OUT_PORT,
      useClass: UserReaderAdapter,
    },
    {
      provide: USER_WRITER_OUT_PORT,
      useClass: UserWriterAdapter,
    },
    {
      provide: AUTH_IN_PORT,
      useClass: AuthService,
    },
  ],
  exports: [AUTH_IN_PORT, AuthGuard, JwtService],
})
export class AuthModule {}
