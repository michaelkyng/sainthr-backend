import { CreateJobApplicationDto } from './create-job-application.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateJobApplicationDto extends PartialType(
  CreateJobApplicationDto,
) {}
