import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  // generic getter (typed access if you want later)
  get(key: string): string {
    return this.config.get<string>(key)!;
  }

  // strongly recommended grouped access

  get nodeEnv() {
    return this.get('NODE_ENV');
  }

  get port() {
    return Number(this.get('PORT'));
  }

  get databaseUrl() {
    return this.get('DATABASE_URL');
  }

  get redis() {
    return {
      host: this.get('REDIS_HOST'),
      port: Number(this.get('REDIS_PORT')),
    };
  }

  get mail() {
    return {
      host: this.get('MAIL_HOST'),
      port: Number(this.get('MAIL_PORT')),
    };
  }

  get postgres() {
    return {
      user: this.get('POSTGRES_USER'),
      password: this.get('POSTGRES_PASSWORD'),
      database: this.get('POSTGRES_DB'),
    };
  }
}
