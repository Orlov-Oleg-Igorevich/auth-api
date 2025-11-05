import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TypedConfigService } from './typed-config/typed-config.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { TypedConfigModule } from './typed-config/typed-config.module';
import { RedisCommonModule } from './common/redis/redis-common.module';

@Module({
  imports: [
    TypedConfigModule,
    AuthModule,
    UserModule,
    EmailModule,
    RedisModule,
    PrismaModule,
    RedisCommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      useFactory: async (config: TypedConfigService) => ({
        transport: {
          host: config.mailHost,
          port: config.mailPort,
          auth: {
            user: config.mailUser,
            pass: config.mailPassword,
          },
        },
        defaults: {
          from: `"Your App" <${config.mailUser}>`,
        },
      }),
      inject: [TypedConfigService],
    }),
  ],
})
export class AppModule {}
