import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { envValidationSchema } from './env.validation';
import { RedisModule } from './infrastructure/redis/redis.module';
import { JobApplicationModule } from '@/modules/job-application/job-application.module';
import { JobModule } from '@/modules/job/job.module';
import { ResumeModule } from '@/modules/resume/resume.module';
import { AppConfigModule } from './infrastructure/config/config.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    RedisModule,
    JobApplicationModule,
    JobModule,
    ResumeModule,
    AppConfigModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
