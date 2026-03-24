import {
  Controller,
  Get,
  Inject,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  InternalServerErrorException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from './infrastructure//prisma/prisma.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS') private readonly redis: Redis,
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  async health() {
    const db = await this.prisma.$queryRaw`SELECT 1`;
    const redis = await this.redis.ping();

    return {
      ok: true,
      db,
      redis,
      timestamp: new Date().toISOString(),
    };
  }

  // @Get('/health')
  // async health() {
  //   try {
  //     await this.prisma.$queryRaw`SELECT 1`;
  //     const redis = await this.redis.ping();

  //     return {
  //       ok: true,
  //       db: 'up',
  //       redis: redis === 'PONG' ? 'up' : 'down',
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException({
  //       ok: false,
  //       db: 'down',
  //       redis: 'down',
  //       message: error instanceof Error ? error.message : 'Health check failed',
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }
}
