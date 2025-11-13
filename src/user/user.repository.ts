import { Injectable } from '@nestjs/common';
import { UserModel } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user-.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findUserById(id: string): Promise<UserModel | null> {
    return this.prismaService.getClient().userModel.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    return this.prismaService.getClient().userModel.findUnique({ where: { email } });
  }

  async updateUser(
    email: string,
    userUpdateObject: Partial<UpdateUserDto>,
  ): Promise<UserModel | null> {
    return this.prismaService
      .getClient()
      .userModel.update({ where: { email }, data: userUpdateObject });
  }
}
