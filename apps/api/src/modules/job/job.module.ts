import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';
import { JobRepository, UserRepository } from '@/common/database/repositories';

@Module({
  imports: [PrismaModule],
  controllers: [JobController],
  providers: [
    JobService,
    {
      provide: 'JobRepository',
      useClass: JobRepository,
    },
    {
      provide: 'UserRepository',
      useClass: UserRepository,
    },
  ],
})
export class JobModule {}
