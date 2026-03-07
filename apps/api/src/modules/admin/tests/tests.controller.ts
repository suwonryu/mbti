import { Body, Controller, Get, Param, ParseIntPipe, Patch, Put, UseGuards } from '@nestjs/common';
import { ok } from '../../../common/api-response';
import { AdminAuthGuard } from '../auth/auth.guard';
import { AdminTestsService } from './tests.service';
import { UpdateTestStatusDto } from './dto/update-test-status.dto';
import { UpdateTestSettingsDto } from './dto/update-test-settings.dto';
import { UpdateAnswerScaleDto } from './dto/update-answer-scale.dto';
import { UpdateTestInfoDto } from './dto/update-test-info.dto';

@Controller('admin/tests')
@UseGuards(AdminAuthGuard)
export class AdminTestsController {
  constructor(private readonly testsService: AdminTestsService) {}

  @Get()
  async getTests() {
    const data = await this.testsService.getTests();
    return ok(data);
  }

  @Get(':id')
  async getTest(@Param('id', ParseIntPipe) id: number) {
    const data = await this.testsService.getTest(id);
    return ok(data);
  }

  @Patch(':id')
  async patchTest(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTestInfoDto) {
    const data = await this.testsService.patchTestInfo(id, body);
    return ok(data);
  }

  @Patch(':id/status')
  async patchStatus(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTestStatusDto) {
    const data = await this.testsService.patchStatus(id, body.status);
    return ok(data);
  }

  @Put(':id/settings')
  async putSettings(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTestSettingsDto) {
    const data = await this.testsService.putSettings(id, body);
    return ok(data);
  }

  @Get(':id/answer-scale')
  async getAnswerScale(@Param('id', ParseIntPipe) id: number) {
    const data = await this.testsService.getAnswerScale(id);
    return ok(data);
  }

  @Put(':id/answer-scale')
  async putAnswerScale(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAnswerScaleDto) {
    const data = await this.testsService.putAnswerScale(id, body);
    return ok(data);
  }
}
