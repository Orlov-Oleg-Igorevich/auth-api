import { JwtModuleOptions } from '@nestjs/jwt';
import { TypedConfigService } from 'src/typed-config/typed-config.service';

export const getJWTconfig = async (
  configService: TypedConfigService,
): Promise<JwtModuleOptions> => {
  const secret = configService.jwtSecret;
  if (!secret) {
    throw new Error('JWT_SECRET не определен в переменных окружения');
  }
  return {
    secret,
  };
};
