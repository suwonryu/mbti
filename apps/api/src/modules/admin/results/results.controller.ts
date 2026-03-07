import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ok } from '../../../common/api-response';
import { AdminAuthGuard } from '../auth/auth.guard';
import { AdminResultsService } from './results.service';
import { UpdateResultDto } from './dto/update-result.dto';
import { CreateResultDto } from './dto/create-result.dto';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminResultsController {
  constructor(private readonly resultsService: AdminResultsService) {}

  @Get('tests/:id/results')
  async getResults(@Param('id', ParseIntPipe) id: number) {
    const data = await this.resultsService.getResults(id);
    return ok(data);
  }

  @Post('tests/:id/results')
  async createResult(@Param('id', ParseIntPipe) id: number, @Body() body: CreateResultDto) {
    const data = await this.resultsService.createResult(id, body);
    return ok(data);
  }

  @Put('results/:resultId')
  async updateResult(@Param('resultId', ParseIntPipe) resultId: number, @Body() body: UpdateResultDto) {
    const data = await this.resultsService.updateResult(resultId, body);
    return ok(data);
  }

  @Delete('results/:resultId')
  async deleteResult(@Param('resultId', ParseIntPipe) resultId: number) {
    const data = await this.resultsService.deleteResult(resultId);
    return ok(data);
  }
}
