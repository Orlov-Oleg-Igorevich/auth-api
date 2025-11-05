import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import {
  TOKEN_INVALID_ERROR,
  TOKEN_UNCORRECTED_VERSION_ERROR,
  USER_DELETED_ERROR,
  USER_NOT_FOUND_ERROR,
  USER_SIGN_INVALID_ERROR,
  WRONG_PASSWORD_ERROR,
} from './auth.constans';
import { randomBytes, createHash } from 'crypto';
import { RefreshView } from 'src/redis/view/refresh.view';
import { JwtService } from '@nestjs/jwt';
import { LoginResponse } from './responses/login.response';
import { UserModel } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  async getUserById(id: string): Promise<UserModel | null> {
    return this.authRepository.findUserById(id);
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    return this.authRepository.findUserByEmail(email);
  }

  async createUser(dto: RegisterDto): Promise<void> {
    const salt = await genSalt(10);
    const hashedPassword = await hash(dto.password, salt);
    const { password, ...newObj } = dto;
    const createdUser = await this.authRepository.create({
      ...newObj,
      hashedPassword,
      isEmailVerified: false,
    });
    const token = this.emailService.generateEmailConfirmationToken();
    await this.emailService.storeEmailToken(createdUser.id, token);
    await this.emailService.sendEmailConfirmation(createdUser.email, token);
  }

  async confirmEmail(token: string): Promise<void> {
    const userId = await this.redisService.get(`email-confirm:${token}`);
    if (!userId) {
      throw new BadRequestException(TOKEN_INVALID_ERROR);
    }
    this.authRepository.update(userId, { isEmailVerified: true });
    await this.redisService.del(`email-confirm:${token}`);
  }

  async getRefreshToken(userId: string, sign: string, tokenVersion: number): Promise<string> {
    const refreshToken = randomBytes(64).toString('hex');
    const deviceFingerprint = createHash('sha256').update(sign).digest('hex');
    const data: RefreshView = {
      userId,
      issuedAt: Date.now(),
      deviceFingerprint,
      tokenVersion,
    };
    this.authRepository.setRefreshToken(refreshToken, data);
    return refreshToken;
  }

  async logOut(refreshToken: string, jwtToken: string): Promise<void> {
    await this.authRepository.delRefreshToken(refreshToken);
    await this.authRepository.updateBlockList(jwtToken);
  }

  async validateJwtToken(token: string): Promise<boolean> {
    const jwt_token = await this.authRepository.getJwtToken(token);
    if (jwt_token) {
      return false;
    }
    return true;
  }

  async validate(
    email: string,
    password: string,
  ): Promise<{ email: string; id: string; tokenVersion: number }> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUND_ERROR);
    }
    const passwordIsTrue = await compare(password, user.hashedPassword);
    if (!passwordIsTrue) {
      throw new UnauthorizedException(WRONG_PASSWORD_ERROR);
    }
    return { email: user.email, id: user.id, tokenVersion: user.tokenVersion };
  }

  async login(userId: string, email: string, tokenVersion: number): Promise<LoginResponse> {
    const payload = { sub: userId, email, exp: Date.now(), tokenVersion };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: Date.now(),
    };
  }

  async validateAndDeleteRefreshToken(token: string, sign: string): Promise<UserModel> {
    const refreshTokenData = await this.authRepository.getRefreshToken(token);
    if (!refreshTokenData) {
      throw new BadRequestException(TOKEN_INVALID_ERROR);
    }

    const refreshTokenParseData: RefreshView = JSON.parse(refreshTokenData);
    const currentDeviceFingerprint = createHash('sha256').update(sign).digest('hex');
    if (refreshTokenParseData.deviceFingerprint !== currentDeviceFingerprint) {
      throw new BadRequestException(USER_SIGN_INVALID_ERROR);
    }

    const user = await this.getUserById(refreshTokenParseData.userId);
    if (!user) {
      throw new NotFoundException(USER_DELETED_ERROR);
    }

    if (user.tokenVersion !== refreshTokenParseData.tokenVersion) {
      throw new BadRequestException(TOKEN_UNCORRECTED_VERSION_ERROR);
    }

    await this.authRepository.delRefreshToken(token);
    return user;
  }
}
