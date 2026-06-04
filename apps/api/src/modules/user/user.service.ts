import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { User } from '../../../generated/prisma/client';
import { UserRepository } from '@/common/database/repositories';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  create(createUserDto: CreateUserDto) {
    return `This action adds a new user ${createUserDto.clerkUserId}`;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findByClerkUserId(clerkUserId: string): Promise<User | null> {
    const user = await this.userRepository.findByClerkUserId(clerkUserId);

    return user;
  }

  findOne(clerkUserId: string) {
    return `This action returns a #${clerkUserId} user`;
  }

  update(clerkUserId: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${clerkUserId} user with data: ${JSON.stringify(
      updateUserDto,
    )}`;
  }

  remove(clerkUserId: string) {
    return `This action removes a #${clerkUserId} user`;
  }
}
