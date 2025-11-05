import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserObject } from './interface/create.interface';
import { RefreshView } from 'src/redis/view/refresh.view';
import { UserModel } from '@prisma/client';
import { RedisCommonService } from 'src/common/redis/redis-common.service';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly redisCommonService: RedisCommonService,
  ) {}

  async findUserById(id: string): Promise<UserModel | null> {
    return this.prismaService.getClient().userModel.findUnique({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    return this.prismaService.getClient().userModel.findUnique({ where: { email } });
  }

  async create(dto: CreateUserObject): Promise<UserModel> {
    return this.prismaService.getClient().userModel.create({ data: dto });
  }

  async update(
    id: string,
    dataUpdatedObject: Partial<Omit<UserModel, 'id' | 'createdAt'>>,
  ): Promise<UserModel> {
    return this.prismaService
      .getClient()
      .userModel.update({ data: dataUpdatedObject, where: { id } });
  }

  async setRefreshToken(token: string, data: RefreshView): Promise<string> {
    return this.redisService.set(`refresh:${token}`, JSON.stringify(data), 30 * 24 * 60 * 60);
  }

  async delRefreshToken(token: string): Promise<number> {
    return this.redisService.del(`refresh:${token}`);
  }

  async getRefreshToken(token: string): Promise<string | null> {
    return await this.redisService.get(`refresh:${token}`);
  }

  async updateBlockList(token: string): Promise<void> {
    this.redisCommonService.set(`jwt:${token}`, '1', 1 * 24 * 60 * 60);
  }

  async getJwtToken(token: string): Promise<string | null> {
    return this.redisCommonService.get(`jwt:${token}`);
  }
}
