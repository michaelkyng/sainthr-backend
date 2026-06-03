import { Module } from '@nestjs/common';
import { clerkProvider } from './clerk.provider';

@Module({
  providers: [clerkProvider],
  exports: [clerkProvider],
})
export class ClerkModule {}
