import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ok } from '../../../common/api-response';
import { AdminAuthGuard } from '../auth/auth.guard';
import { AdminTestsService } from '../tests/tests.service';

@Controller('admin/tests')
@UseGuards(AdminAuthGuard)
export class AdminPreviewController {
  constructor(private readonly testsService: AdminTestsService) {}

  @Get(':id/preview')
  async preview(@Param('id', ParseIntPipe) id: number) {
    const data = await this.testsService.getPublishReadiness(id);
    return ok(data);
  }
}
