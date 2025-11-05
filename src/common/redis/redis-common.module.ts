import { Global, Module } from '@nestjs/common';
import { RedisCommonService } from './redis-common.service';

@Global()
@Module({
  providers: [RedisCommonService],
  exports: [RedisCommonService],
})
export class RedisCommonModule {}
