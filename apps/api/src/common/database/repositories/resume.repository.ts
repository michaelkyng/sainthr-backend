import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class ResumeRepository extends BaseRepository<PrismaService['resume']> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.resume);
  }
}
