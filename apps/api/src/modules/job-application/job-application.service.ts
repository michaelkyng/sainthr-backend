import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import {
  JobApplicationRepository,
  JobApplicationStatusHistoryRepository,
  UserRepository,
  JobRepository,
  ResumeRepository,
} from '@/common/database/repositories';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  type Job,
  JobApplicationStatus,
  Prisma,
} from '../../../generated/prisma/client';
import { isDuplicateEntries, isDeadlock } from '@/helpers/postgres.handlers';

@Injectable()
export class JobApplicationService {
  private maxRetries = 3;

  constructor(
    @Inject('JobApplicationRepository')
    private readonly jobApplicationRepository: JobApplicationRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('JobRepository')
    private readonly jobRepository: JobRepository,
    @Inject('ResumeRepository')
    private readonly resumeRepository: ResumeRepository,
    private prisma: PrismaService,
    @Inject('JobApplicationStatusHistoryRepository')
    private readonly jobApplicationStatusHistoryRepository: JobApplicationStatusHistoryRepository,
  ) {}

  private async jobCreateTransaction(
    createJobApplicationDto: CreateJobApplicationDto,
    retryCount = this.maxRetries,
  ): Promise<{ message: string; data: any }> {
    const user = await this.userRepository.findOne(
      { clerkUserId: createJobApplicationDto.clerkUserId },
      { candidateProfile: true },
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.candidateProfile) {
      throw new BadRequestException('Candidate profile not found');
    }
    const resume = await this.resumeRepository.findOne({
      id: createJobApplicationDto.resumeId,
    });
    if (!resume) {
      throw new BadRequestException('Resume not found');
    }
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const jobs = await tx.$queryRaw<Job[]>`
        SELECT * FROM "Job"
        WHERE id = ${createJobApplicationDto.jobId}
        FOR UPDATE
      `;

        const job = jobs[0];

        if (!job || job.status !== 'OPEN') {
          throw new BadRequestException('Job not found');
        }

        const newJobApplication = await tx.jobApplication.create({
          data: {
            jobId: createJobApplicationDto.jobId,
            resumeId: createJobApplicationDto.resumeId,
            resumeSnapshotUrl: resume.fileUrl,
            resumeSnapshotData: {
              fileName: resume.fileName,
              mimeType: resume.mimeType,
              fileSize: resume.fileSize,
            },
            coverLetter: createJobApplicationDto.coverLetter,
            candidateProfileId: user.candidateProfile!.id,
          },
        });

        await tx.applicationStatusHistory.create({
          data: {
            jobApplicationId: newJobApplication.id,
            oldStatus: null,
            newStatus: JobApplicationStatus.PENDING,
            changedByUserId: user.id,
          },
        });

        return newJobApplication;
      });

      return {
        message: 'Job application created successfully',
        data: result,
      };
    } catch (error: unknown) {
      console.error('Error creating job application:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (isDuplicateEntries(error.code)) {
          const existing = await this.jobApplicationRepository.findOne({
            jobId_candidateProfileId: {
              jobId: createJobApplicationDto.jobId,
              candidateProfileId: user.candidateProfile.id,
            },
          });

          return {
            message: 'Job application already exists',
            data: existing,
          };
        }
        if (isDeadlock(error.code)) {
          await this.jobCreateTransaction(
            createJobApplicationDto,
            retryCount - 1,
          );
        }
      }

      throw new BadRequestException('Something went wrong while applying');
    }
  }

  async create(createJobApplicationDto: CreateJobApplicationDto) {
    if (
      !createJobApplicationDto.clerkUserId ||
      createJobApplicationDto.clerkUserId.trim() === '' ||
      !createJobApplicationDto.jobId ||
      createJobApplicationDto.jobId.trim() === '' ||
      !createJobApplicationDto.resumeId ||
      createJobApplicationDto.resumeId.trim() === '' ||
      !createJobApplicationDto.coverLetter ||
      createJobApplicationDto.coverLetter.trim() === ''
    ) {
      throw new BadRequestException('All fields are required');
    }
    const result = await this.jobCreateTransaction(createJobApplicationDto);
    return result;
  }

  findAll() {
    return `This action returns all jobApplication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobApplication`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateJobApplicationDto: UpdateJobApplicationDto) {
    return `This action updates a #${id} jobApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobApplication`;
  }
}
