import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class CountryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    // ADMIN has global access
    if (user.role === Role.ADMIN) {
      return true;
    }

    // For requests that include a country param or body
    const requestCountry =
      request.params?.country ||
      request.body?.country ||
      request.query?.country;

    if (requestCountry && user.country && requestCountry !== user.country) {
      throw new ForbiddenException(
        `Access denied. You can only access data from ${user.country}.`,
      );
    }

    return true;
  }
}
