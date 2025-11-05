import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypedConfigService {
  constructor(private config: ConfigService) {}

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET')!;
  }

  get databaseUrl(): string {
    return this.config.get<string>('DATABASE_URL')!;
  }

  get redisHost(): string {
    return this.config.get<string>('REDIS_LOCAL_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.config.get<number>('REDIS_PORT', 6379);
  }

  get redisCommonHost(): string {
    return this.config.get<string>('REDIS_COMMON_LOCAL_HOST', 'localhost');
  }

  get redisCommonPort(): number {
    return this.config.get<number>('REDIS_COMMON_LOCAL_PORT', 6379);
  }

  get frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  get mailUser(): string {
    return this.config.get<string>('MAIL_USER', '1@mail.ru');
  }

  get mailPassword(): string {
    return this.config.get<string>('MAIL_PASSWORD', '1');
  }

  get mailHost(): string {
    return this.config.get<string>('MAIL_HOST', 'smtp.google.com');
  }

  get mailPort(): number {
    return this.config.get<number>('MAIL_PORT', 465);
  }
}
