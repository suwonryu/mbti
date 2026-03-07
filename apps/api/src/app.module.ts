import { Module } from '@nestjs/common';
import { PublicModule } from './modules/public/public.module';
import { AdminAuthModule } from './modules/admin/auth/auth.module';
import { AdminTestsModule } from './modules/admin/tests/tests.module';
import { AdminQuestionsModule } from './modules/admin/questions/questions.module';
import { AdminResultsModule } from './modules/admin/results/results.module';
import { AdminPreviewModule } from './modules/admin/preview/preview.module';

@Module({
  imports: [
    PublicModule,
    AdminAuthModule,
    AdminTestsModule,
    AdminQuestionsModule,
    AdminResultsModule,
    AdminPreviewModule,
  ],
})
export class AppModule {}
