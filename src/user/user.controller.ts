import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from './user.service';
import { UserModel } from '@prisma/client';
import { type Request } from 'express';
import { UpdateUserDto } from './dto/update-user-.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@Req() req: Request): Promise<UserModel | null> {
    return this.userService.getUserByEmail(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto): Promise<UserModel | null> {
    return this.userService.updateUser(req.user.email, dto);
  }
}
