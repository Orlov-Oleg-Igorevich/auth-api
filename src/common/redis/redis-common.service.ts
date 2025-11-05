import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { TypedConfigService } from 'src/typed-config/typed-config.service';

@Injectable()
export class RedisCommonService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor(private readonly configService: TypedConfigService) {
    const host = configService.redisCommonHost;
    const port = configService.redisCommonPort;
    this.client = new Redis({
      host,
      port,
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      return this.client.del(...keys);
    }
    return 0;
  }
}
