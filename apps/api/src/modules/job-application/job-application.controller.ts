import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { JobApplicationService } from './job-application.service';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('job-application')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @ApiOperation({ summary: 'Create a new job application' })
  @Post()
  apply(@Body() createJobApplicationDto: CreateJobApplicationDto) {
    return this.jobApplicationService.create(createJobApplicationDto);
  }

  @ApiOperation({ summary: 'Retrieve all job applications' })
  @Get()
  findAll() {
    return this.jobApplicationService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a specific job application by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobApplicationService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a specific job application by ID' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationService.update(+id, updateJobApplicationDto);
  }

  @ApiOperation({ summary: 'Remove a specific job application by ID' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobApplicationService.remove(+id);
  }
}
