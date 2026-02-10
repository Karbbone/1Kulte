import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptService } from 'src/shares/crypt/crypt.service';
import { MinioService } from 'src/shares/minio/minio.service';
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
    private readonly minioService: MinioService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne(id);
    if (!user) return null;
    return this.addProfilePictureUrl(user);
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
    const userWithUrl = this.addProfilePictureUrl(user);
    const payload = { user: userWithUrl };
    const token = this.jwtService.sign(payload);
    return { user: userWithUrl, token };
  }

  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async updateProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Supprimer l'ancienne photo si elle existe
    if (user.profilePicture) {
      try {
        await this.minioService.deleteFile(user.profilePicture);
      } catch {
        // Ignorer si le fichier n'existe plus
      }
    }

    const filePath = await this.minioService.uploadFile(
      file,
      `avatars/${userId}`,
    );
    user.profilePicture = filePath;
    const savedUser = await this.userRepository.save(user);
    return this.addProfilePictureUrl(savedUser);
  }

  addProfilePictureUrl(
    user: User,
  ): User & { profilePictureUrl: string | null } {
    return {
      ...user,
      profilePictureUrl: user.profilePicture
        ? this.minioService.getFileUrl(user.profilePicture)
        : null,
    };
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
