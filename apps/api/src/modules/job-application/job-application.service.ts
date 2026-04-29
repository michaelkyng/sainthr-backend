import { Injectable } from '@nestjs/common';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';

@Injectable()
export class JobApplicationService {
  create(createJobApplicationDto: CreateJobApplicationDto) {
    if (!createJobApplicationDto.clerkUserId) {
      throw new Error('Clerk User ID is required');
    }
  }

  findAll() {
    return `This action returns all jobApplication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobApplication`;
  }

  update(id: number, updateJobApplicationDto: UpdateJobApplicationDto) {
    return `This action updates a #${id} jobApplication`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobApplication`;
  }
}
