import { createClerkClient } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

export const CLERK_CLIENT = 'CLERK_CLIENT';

export const clerkProvider = {
  provide: CLERK_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return createClerkClient({
      secretKey: configService.get<string>('CLERK_SECRET_KEY'),
    });
  },
};
