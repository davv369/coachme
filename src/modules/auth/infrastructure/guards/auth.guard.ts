import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../../application/services/jwt.service';
import { UserRole } from '../../domain/user-role';

export const AUTH_META_KEY = 'auth:meta';

export interface AuthenticatedMeta {
  requiredRoles?: UserRole[];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    try {
      const payload = this.jwtService.verifyToken(token);
      const meta = this.reflector.get<AuthenticatedMeta | undefined>(
        AUTH_META_KEY,
        context.getHandler(),
      );

      if (meta?.requiredRoles && !meta.requiredRoles.includes(payload.role)) {
        throw new UnauthorizedException(
          `Required role: ${meta.requiredRoles.join(' or ')}`,
        );
      }

      (request as any).user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null;
    }

    const match = authHeader.match(/^Bearer (.+)$/i);
    return match ? match[1] : null;
  }
}
