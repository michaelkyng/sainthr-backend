import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class JobRepository extends BaseRepository<PrismaService['job']> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.job);
  }
}
