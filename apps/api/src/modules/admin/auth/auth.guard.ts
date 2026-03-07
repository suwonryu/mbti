import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiHttpException } from '../../../common/api-error';
import type { AdminJwtPayload } from './auth.types';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers?: { authorization?: string };
      user?: AdminJwtPayload;
    }>();

    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'MISSING_AUTH_TOKEN', '인증 토큰이 필요합니다.');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'INVALID_AUTH_HEADER', 'Authorization 헤더 형식이 올바르지 않습니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token);

      if (!payload?.sub || !payload.email || !payload.role) {
        throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'INVALID_AUTH_TOKEN', '인증 토큰이 유효하지 않습니다.');
      }

      request.user = payload;
      return true;
    } catch {
      throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'INVALID_AUTH_TOKEN', '인증 토큰이 유효하지 않습니다.');
    }
  }
}
