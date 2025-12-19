import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptService } from 'src/shares/crypt/crypt.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptService: CryptService,
    private readonly jwtService: JwtService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async create(userData: CreateUserDto): Promise<User> {
    userData.password = await this.cryptService.hashPassword(userData.password);
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async login(
    loginData: LoginUserDto,
  ): Promise<{ user: User; token: string } | null> {
    const user = await this.findByEmail(loginData.email);
    if (!user) {
      return null;
    }
    const isPasswordValid = await this.cryptService.comparePasswords(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      return null;
    }
    const payload = { user: user };
    const token = this.jwtService.sign(payload);
    return { user, token };
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
