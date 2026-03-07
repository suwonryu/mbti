import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ok } from '../../../common/api-response';
import { AdminAuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdminAuthGuard } from './auth.guard';
import type { AdminJwtPayload } from './auth.types';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const data = await this.authService.login(body);
    return ok(data);
  }

  @UseGuards(AdminAuthGuard)
  @Get('me')
  async me(@Req() request: { user: AdminJwtPayload }) {
    const data = await this.authService.me(request.user);
    return ok(data);
  }
}
