import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from './application/services/jwt.service';
import { AuthGuard } from './infrastructure/guards/auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [JwtService, AuthGuard],
  exports: [JwtService, AuthGuard],
})
export class AuthModule {}
