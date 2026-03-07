import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { ApiHttpException } from '../../../common/api-error';
import { AdminAuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import type { AdminJwtPayload } from './auth.types';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly repository: AdminAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(body: LoginDto) {
    const admin = await this.repository.findByEmail(body.email);

    if (!admin) {
      throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isValidPassword = await compare(body.password, admin.passwordHash);

    if (!isValidPassword) {
      throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const payload: AdminJwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async me(payload: AdminJwtPayload) {
    const admin = await this.repository.findById(payload.sub);

    if (!admin) {
      throw new ApiHttpException(HttpStatus.UNAUTHORIZED, 'INVALID_TOKEN', '인증 토큰이 유효하지 않습니다.');
    }

    return admin;
  }
}
