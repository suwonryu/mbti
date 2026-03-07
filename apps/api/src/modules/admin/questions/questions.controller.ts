import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ok } from '../../../common/api-response';
import { AdminAuthGuard } from '../auth/auth.guard';
import { CreateQuestionDto } from './dto/create-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AdminQuestionsService } from './questions.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
export class AdminQuestionsController {
  constructor(private readonly questionsService: AdminQuestionsService) {}

  @Get('tests/:id/questions')
  async getQuestions(@Param('id', ParseIntPipe) id: number) {
    const data = await this.questionsService.getQuestions(id);
    return ok(data);
  }

  @Post('tests/:id/questions')
  async createQuestion(@Param('id', ParseIntPipe) id: number, @Body() body: CreateQuestionDto) {
    const data = await this.questionsService.createQuestion(id, body);
    return ok(data);
  }

  @Put('questions/:questionId')
  async updateQuestion(@Param('questionId', ParseIntPipe) questionId: number, @Body() body: UpdateQuestionDto) {
    const data = await this.questionsService.updateQuestion(questionId, body);
    return ok(data);
  }

  @Delete('questions/:questionId')
  async removeQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    const data = await this.questionsService.removeQuestion(questionId);
    return ok(data);
  }

  @Patch('tests/:id/questions/order')
  async reorderQuestions(@Param('id', ParseIntPipe) id: number, @Body() body: ReorderQuestionsDto) {
    const data = await this.questionsService.reorderQuestions(id, body);
    return ok(data);
  }
}
