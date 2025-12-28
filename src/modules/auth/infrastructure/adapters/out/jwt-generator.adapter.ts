import { Injectable } from '@nestjs/common';
import { JwtService } from '@auth/application/services/jwt.service';
import {
  GenerateTokenPairRequest,
  JwtGeneratorOutPort,
  VerifyTokenRequest,
} from '@auth/application/ports/out/jwt-generator.out-port';
import { JwtPayload } from '@auth/domain/jwt-payload';

@Injectable()
export class JwtGeneratorAdapter implements JwtGeneratorOutPort {
  constructor(private readonly jwtService: JwtService) {}

  generateTokenPair(request: GenerateTokenPairRequest) {
    return this.jwtService.generateTokenPair(
      request.userId,
      request.email,
      request.role,
    );
  }

  verifyToken(request: VerifyTokenRequest): JwtPayload {
    return this.jwtService.verifyToken(request.token);
  }
}
