import { Module } from '@nestjs/common';
import { AdminResultsController } from './results.controller';
import { AdminAuthModule } from '../auth/auth.module';
import { AdminResultsService } from './results.service';
import { AdminResultsRepository } from './results.repository';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminResultsController],
  providers: [AdminResultsService, AdminResultsRepository],
})
export class AdminResultsModule {}
