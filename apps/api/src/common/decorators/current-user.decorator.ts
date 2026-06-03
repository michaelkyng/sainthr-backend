import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { ClerkRequest } from '@/common/types/auth.type';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<ClerkRequest>();

    return req.user;
  },
);
