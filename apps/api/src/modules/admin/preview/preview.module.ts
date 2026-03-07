import { Module } from '@nestjs/common';
import { AdminPreviewController } from './preview.controller';
import { AdminAuthModule } from '../auth/auth.module';
import { AdminTestsModule } from '../tests/tests.module';

@Module({
  imports: [AdminAuthModule, AdminTestsModule],
  controllers: [AdminPreviewController],
})
export class AdminPreviewModule {}
