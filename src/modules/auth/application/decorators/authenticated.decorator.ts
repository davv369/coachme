import { SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import {
  AuthGuard,
  AUTH_META_KEY,
  AuthenticatedMeta,
} from '../../infrastructure/guards/auth.guard';

export const AUTH_API_BEARER_BUILDER_KEY = 'JWT-Auth';

export function Authenticated(
  meta: AuthenticatedMeta = {},
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    SetMetadata(AUTH_META_KEY, meta)(
      target,
      propertyKey as any,
      descriptor as any,
    );
    UseGuards(AuthGuard)(target, propertyKey as any, descriptor as any);
    ApiBearerAuth(AUTH_API_BEARER_BUILDER_KEY)(
      target,
      propertyKey as any,
      descriptor as any,
    );
    ApiUnauthorizedResponse({ description: 'Unauthorized' })(
      target,
      propertyKey as any,
      descriptor as any,
    );
  };
}
