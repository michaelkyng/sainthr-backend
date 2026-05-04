import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class JobApplicationStatusHistoryRepository extends BaseRepository<
  PrismaService['applicationStatusHistory']
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.applicationStatusHistory);
  }
}
