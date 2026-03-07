import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './auth.controller';
import { AdminAuthRepository } from './auth.repository';
import { AdminAuthService } from './auth.service';
import { AdminAuthGuard } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'local-dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthRepository, AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthGuard, JwtModule],
})
export class AdminAuthModule {}
