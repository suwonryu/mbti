import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicRepository } from './public.repository';
import { PublicService } from './public.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicController],
  providers: [PublicRepository, PublicService],
})
export class PublicModule {}
