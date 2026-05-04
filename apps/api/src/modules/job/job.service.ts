import { Inject, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UserRepository } from '@/common/database/repositories';
import { JobRepository } from '@/common/database/repositories/job.repository';

@Injectable()
export class JobService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('JobRepository')
    private readonly jobRepository: JobRepository,
  ) {}

  create(CreateJobDto: CreateJobDto) {
    return {
      message: 'Job application created successfully',
      data: CreateJobDto,
    };
  }

  findAll() {
    return `This action returns all jobApplication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobApplication`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateJobApplicationDto: UpdateJobDto) {
    return `This action updates a #${id} jobApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobApplication`;
  }
}
