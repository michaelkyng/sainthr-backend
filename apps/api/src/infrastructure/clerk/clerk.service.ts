import { Injectable, Inject } from '@nestjs/common';
import { CLERK_CLIENT } from './clerk.provider';
import type { ClerkClient } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import type { Request } from 'express';

@Injectable()
export class ClerkService {
  constructor(
    @Inject(CLERK_CLIENT) private readonly clerkClient: ClerkClient,
  ) {}

  async verifyRequest(req: Request): Promise<RequestState> {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const request = new Request(`http://placeholder${req.originalUrl}`, {
      method: req.method,
      headers,
    });

    return this.clerkClient.authenticateRequest(request);
  }

  async getUser(clerkId: string) {
    return this.clerkClient.users.getUser(clerkId);
  }

  async updateUserMetadata(clerkId: string, metadata: Record<string, any>) {
    return this.clerkClient.users.updateUser(clerkId, {
      publicMetadata: metadata,
    });
  }
}
