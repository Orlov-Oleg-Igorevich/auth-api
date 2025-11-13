import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserModel } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user-.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async getUserById(id: string): Promise<UserModel | null> {
    return this.userRepository.findUserById(id);
  }

  async getUserByEmail(email: string): Promise<UserModel | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async updateUser(
    email: string,
    updateUserObject: Partial<UpdateUserDto>,
  ): Promise<UserModel | null> {
    return this.userRepository.updateUser(email, updateUserObject);
  }
}
