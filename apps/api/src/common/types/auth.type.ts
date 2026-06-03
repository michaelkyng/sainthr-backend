import type { SignedInAuthObject } from '@clerk/backend/internal';
import type { Request } from 'express';
import { User } from '../../../generated/prisma/client';

export interface ClerkRequest extends Request {
  auth: SignedInAuthObject;
  user: User;
}
