import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ok } from '../../common/api-response';
import { SubmitAnswersDto } from './submit-answers.dto';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('tests/:slug')
  async getPublishedTest(@Param('slug') slug: string) {
    const data = await this.publicService.getPublishedTest(slug);
    return ok(data);
  }

  @Get('tests/:slug/questions')
  async getPublishedQuestions(@Param('slug') slug: string) {
    const data = await this.publicService.getPublishedQuestions(slug);
    return ok(data);
  }

  @Post('tests/:slug/submit')
  async submit(@Param('slug') slug: string, @Body() body: SubmitAnswersDto) {
    const data = await this.publicService.submit(slug, body);
    return ok(data);
  }

  @Get('results/:shareToken')
  async getSharedResult(@Param('shareToken') shareToken: string) {
    const data = await this.publicService.getSharedResult(shareToken);
    return ok(data);
  }
}
