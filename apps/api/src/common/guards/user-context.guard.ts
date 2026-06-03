import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { ClerkRequest } from '@/common/types/auth.type';
import { UserService } from '@/modules/user/user.service';

@Injectable()
export class UserContextGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<ClerkRequest>();

    const clerkUserId = req.auth.userId;

    const user = await this.userService.findByClerkUserId(clerkUserId);

    if (!user) {
      throw new UnauthorizedException('User not onboarded');
    }

    req.user = user;

    return true;
  }
}
