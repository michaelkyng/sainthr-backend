import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    description: 'login payload',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;
}
