import { UserRole } from '../../../domain/user-role';
import { JwtPayload } from '../../../domain/jwt-payload';

export const JWT_GENERATOR_OUT_PORT = Symbol('JWT_GENERATOR_OUT_PORT');

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface GenerateTokenPairRequest {
  userId: string;
  email: string;
  role: UserRole;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface JwtGeneratorOutPort {
  generateTokenPair(request: GenerateTokenPairRequest): TokenPair;
  verifyToken(request: VerifyTokenRequest): JwtPayload;
}

