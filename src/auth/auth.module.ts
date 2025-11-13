import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AuthController } from './auth.controller';
import { EmailModule } from 'src/email/email.module';
import { TypedConfigModule } from 'src/typed-config/typed-config.module';
import { TypedConfigService } from 'src/typed-config/typed-config.service';
import { JwtModule } from '@nestjs/jwt';
import { getJWTconfig } from 'src/config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    EmailModule,
    JwtModule.registerAsync({
      imports: [TypedConfigModule],
      inject: [TypedConfigService],
      useFactory: getJWTconfig,
    }),
    UserModule,
  ],
  providers: [AuthService, AuthRepository, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
