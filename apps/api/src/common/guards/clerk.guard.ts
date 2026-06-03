import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ClerkService } from '@/infrastructure/clerk/clerk.service';
import type { ClerkRequest } from '@/common/types/auth.type';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly clerkService: ClerkService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<ClerkRequest>();

    const authState = await this.clerkService.verifyRequest(req);

    if (!authState.isAuthenticated) {
      throw new UnauthorizedException('Unauthenticated');
    }

    req.auth = authState.toAuth();

    return true;
  }
}
