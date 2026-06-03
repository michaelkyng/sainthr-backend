import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ClerkAuthGuard } from '@/common/guards/clerk.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { UserContextGuard } from '@/common/guards/user-context.guard';
import { User } from '../../../generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @ApiOperation({ summary: 'Retrieve current user information' })
  @Get('me')
  @UseGuards(ClerkAuthGuard, UserContextGuard)
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
