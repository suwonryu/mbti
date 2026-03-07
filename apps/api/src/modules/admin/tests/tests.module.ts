import { Module } from '@nestjs/common';
import { AdminTestsController } from './tests.controller';
import { AdminAuthModule } from '../auth/auth.module';
import { AdminTestsService } from './tests.service';
import { AdminTestsRepository } from './tests.repository';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminTestsController],
  providers: [AdminTestsService, AdminTestsRepository],
  exports: [AdminTestsService],
})
export class AdminTestsModule {}
