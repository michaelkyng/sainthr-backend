import { Module } from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { JobApplicationController } from './job-application.controller';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';
import {
  JobApplicationRepository,
  JobRepository,
  UserRepository,
  ResumeRepository,
  JobApplicationStatusHistoryRepository,
} from '@/common/database/repositories';

@Module({
  imports: [PrismaModule],
  controllers: [JobApplicationController],
  providers: [
    JobApplicationService,
    {
      provide: 'JobApplicationRepository',
      useClass: JobApplicationRepository,
    },
    {
      provide: 'UserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'JobRepository',
      useClass: JobRepository,
    },
    {
      provide: 'ResumeRepository',
      useClass: ResumeRepository,
    },
    {
      provide: 'JobApplicationStatusHistoryRepository',
      useClass: JobApplicationStatusHistoryRepository,
    },
  ],
})
export class JobApplicationModule {}
