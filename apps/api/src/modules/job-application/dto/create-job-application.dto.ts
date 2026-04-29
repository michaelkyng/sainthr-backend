import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateJobApplicationDto {
  @ApiProperty({
    description: 'Invite token',
    example: '1234567890abcdef',
  })
  @IsString()
  clerkUserId!: string;

  @ApiProperty({
    description: 'Job ID',
    example: 1,
  })
  @IsString()
  jobId!: string;

  @ApiProperty({
    description: 'Resume ID',
    example: 1,
  })
  @IsString()
  resumeId!: string;

  @ApiProperty({
    description: 'Cover Letter',
    example: 'I am excited about this opportunity...',
  })
  @IsString()
  coverLetter!: string;
}
