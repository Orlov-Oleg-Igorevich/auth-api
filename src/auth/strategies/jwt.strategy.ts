import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TypedConfigService } from 'src/typed-config/typed-config.service';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { AuthService } from '../auth.service';
import {
  TOKEN_BLOCKLIST_ERROR,
  TOKEN_UNCORRECTED_VERSION_ERROR,
  USER_NOT_FOUND_ERROR,
} from '../auth.constans';
import { type Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: TypedConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<{ email: string; token: string }> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token || !(await this.authService.validateJwtToken(token))) {
      throw new UnauthorizedException(TOKEN_BLOCKLIST_ERROR);
    }

    const user = await this.userService.getUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
    } else if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException(TOKEN_UNCORRECTED_VERSION_ERROR);
    }

    return { email: user.email, token };
  }
}
