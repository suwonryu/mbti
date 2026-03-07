import { Module } from '@nestjs/common';
import { AdminQuestionsController } from './questions.controller';
import { AdminAuthModule } from '../auth/auth.module';
import { AdminQuestionsService } from './questions.service';
import { AdminQuestionsRepository } from './questions.repository';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminQuestionsController],
  providers: [AdminQuestionsService, AdminQuestionsRepository],
})
export class AdminQuestionsModule {}
