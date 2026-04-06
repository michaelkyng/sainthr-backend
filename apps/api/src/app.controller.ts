import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
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
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const redis = await this.redis.ping();

      return {
        ok: true,
        db: 'up',
        redis: redis === 'PONG' ? 'up' : 'down',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        ok: false,
        db: 'down',
        redis: 'down',
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // @Get('/health/live')
  // live() {
  //   return {
  //     ok: true,
  //     status: 'up',
  //     timestamp: new Date().toISOString(),
  //   };
  // }

  // @Get('/health/ready')
  // async ready() {
  //   try {
  //     await this.prisma.$queryRaw`SELECT 1`;
  //     const redisPing = await this.redis.ping();

  //     const redisStatus = redisPing === 'PONG' ? 'up' : 'down';

  //     if (redisStatus !== 'up') {
  //       throw new Error('Redis ping failed');
  //     }

  //     return {
  //       ok: true,
  //       db: 'up',
  //       redis: redisStatus,
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error) {
  //     throw new ServiceUnavailableException({
  //       ok: false,
  //       db: 'down',
  //       redis: 'down',
  //       message:
  //         error instanceof Error ? error.message : 'Readiness check failed',
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }
}
