import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Invite token',
    example: '1234567890abcdef',
  })
  @IsString()
  clerkUserId!: string;
}
