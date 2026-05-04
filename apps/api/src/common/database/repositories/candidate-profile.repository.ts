import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { BaseRepository } from './base.repository';

@Injectable()
export class CandidateProfileRepository extends BaseRepository<
  PrismaService['candidateProfile']
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.candidateProfile);
  }
}
