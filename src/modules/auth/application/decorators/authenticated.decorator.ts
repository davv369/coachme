import { SetMetadata, UseGuards } from '@nestjs/common';
import {
  AuthGuard,
  AUTH_META_KEY,
  AuthenticatedMeta,
} from '../../infrastructure/guards/auth.guard';

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
  };
}
