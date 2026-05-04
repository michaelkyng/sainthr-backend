import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class JobApplicationRepository extends BaseRepository<
  PrismaService['jobApplication']
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.jobApplication);
  }
}
