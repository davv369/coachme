import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../domain/jwt-payload';
import { UserRole } from '../../domain/user-role';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class JwtService {
  private readonly secret: string;

  constructor(private readonly configService: ConfigService) {
    this.secret =
      this.configService.get<string>('JWT_SECRET') ||
      'my-secret-key';
  }

  generateAccessToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const expiresIn: string =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h';
    return jwt.sign(payload, this.secret, {
      expiresIn,
    } as jwt.SignOptions);
  }

  generateRefreshToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const expiresIn: string =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    return jwt.sign(payload, this.secret, {
      expiresIn,
    } as jwt.SignOptions);
  }

  generateTokenPair(userId: string, email: string, role: UserRole): TokenPair {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId, email, role),
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload | null;
    } catch {
      return null;
    }
  }
}
