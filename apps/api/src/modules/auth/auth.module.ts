import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ClerkService } from '@/infrastructure/clerk/clerk.service';
import { ClerkModule } from '@/infrastructure/clerk/clerk.module';
import { UserService } from '../user/user.service';
import { UserRepository } from '@/common/database/repositories/user.repository';

@Module({
  imports: [ClerkModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    ClerkService,
    UserService,
    {
      provide: 'UserRepository',
      useClass: UserRepository,
    },
  ],
})
export class AuthModule {}
