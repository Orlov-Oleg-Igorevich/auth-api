import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import {
  ALREADY_REGISTERED_ERROR,
  TOKEN_NOT_FOUND_ERROR,
  USER_DELETED_ERROR,
} from './auth.constans';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import type { Response, Request } from 'express';
import { LoginResponse } from './responses/login.response';
import { UserModel } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    const oldUser = await this.authService.getUserByEmail(dto.email);
    if (oldUser) {
      throw new BadRequestException(ALREADY_REGISTERED_ERROR);
    }
    await this.authService.createUser(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Body() { email, password }: LoginDto,
  ): Promise<LoginResponse> {
    const user = await this.authService.validate(email, password);
    const sign =
      (req.headers['user-agent'] ?? '') + (req.ip ?? '') + (req.headers['accept-language'] ?? '');
    const refreshToken = await this.authService.getRefreshToken(user.id, sign, user.tokenVersion);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return this.authService.login(user.id, user.email, user.tokenVersion);
  }

  @HttpCode(200)
  @Post('confirm-email')
  async confirmEmail(@Body() { token }: ConfirmEmailDto): Promise<void> {
    await this.authService.confirmEmail(token);
  }

  @Get('refresh')
  async tokenRefresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const oldRefreshToken = req.cookies['refresh_token'];
    if (!oldRefreshToken) {
      throw new UnauthorizedException(TOKEN_NOT_FOUND_ERROR);
    }

    const sign =
      (req.headers['user-agent'] ?? '') + (req.ip ?? '') + (req.headers['accept-language'] ?? '');
    const user = await this.authService.validateAndDeleteRefreshToken(oldRefreshToken, sign);

    const refreshToken = await this.authService.getRefreshToken(user.id, sign, user.tokenVersion);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return this.authService.login(user.id, user.email, user.tokenVersion);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@Req() req: Request): Promise<UserModel | null> {
    return this.authService.getUserByEmail(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('exit')
  async exit(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logOut(req.cookies['refresh_token'], req.user.token);
    res.cookie('refresh_token', '', {
      httpOnly: true,
      // secure: true,
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 0,
    });
  }
}
