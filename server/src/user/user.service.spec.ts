import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { UserRepository } from './user.repository';
import { CryptService } from '../shares/crypt/crypt.service';
import { MinioService } from '../shares/minio/minio.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let cryptService: jest.Mocked<CryptService>;
  let jwtService: jest.Mocked<JwtService>;
  let minioService: jest.Mocked<MinioService>;

  const mockUser: User = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'hashed-password',
    newsletter: false,
    birthDate: null,
    emailVerified: true,
    points: 100,
    profilePicture: 'avatars/user-1/photo.png',
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserNoPicture: User = {
    ...mockUser,
    id: 'user-2',
    profilePicture: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CryptService,
          useValue: {
            hashPassword: jest.fn(),
            comparePasswords: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
    cryptService = module.get(CryptService);
    jwtService = module.get(JwtService);
    minioService = module.get(MinioService);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      userRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user with profilePictureUrl', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      minioService.getFileUrl.mockReturnValue(
        'http://minio/avatars/user-1/photo.png',
      );

      const result = await service.findOne('user-1');

      expect(result).toBeDefined();
      expect(result.profilePictureUrl).toBe(
        'http://minio/avatars/user-1/photo.png',
      );
    });

    it('should return profilePictureUrl: null if no profile picture', async () => {
      userRepository.findOne.mockResolvedValue(mockUserNoPicture);

      const result = await service.findOne('user-2');

      expect(result.profilePictureUrl).toBeNull();
    });

    it('should return null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@test.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@test.com');
    });

    it('should return null if email not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@test.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@test.com',
        password: 'plaintext',
      };
      cryptService.hashPassword.mockResolvedValue('hashed');
      const created = { ...mockUser, ...dto, password: 'hashed' } as User;
      userRepository.create.mockReturnValue(created);
      userRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(cryptService.hashPassword).toHaveBeenCalledWith('plaintext');
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed' }),
      );
      expect(result).toEqual(created);
    });
  });

  describe('login', () => {
    it('should return user and token on valid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      cryptService.comparePasswords.mockResolvedValue(true);
      minioService.getFileUrl.mockReturnValue(
        'http://minio/avatars/user-1/photo.png',
      );
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({
        email: 'john@test.com',
        password: 'correct',
      });

      expect(result).toBeDefined();
      expect(result.token).toBe('jwt-token');
      expect(result.user.profilePictureUrl).toBe(
        'http://minio/avatars/user-1/photo.png',
      );
    });

    it('should return null if email not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.login({
        email: 'wrong@test.com',
        password: 'pass',
      });

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      cryptService.comparePasswords.mockResolvedValue(false);

      const result = await service.login({
        email: 'john@test.com',
        password: 'wrong',
      });

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return user with profilePictureUrl', async () => {
      userRepository.update.mockResolvedValue(undefined);
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        firstName: 'Updated',
      });
      minioService.getFileUrl.mockReturnValue(
        'http://minio/avatars/user-1/photo.png',
      );

      const result = await service.update('user-1', { firstName: 'Updated' });

      expect(userRepository.update).toHaveBeenCalledWith('user-1', {
        firstName: 'Updated',
      });
      expect(result.firstName).toBe('Updated');
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt', async () => {
      userRepository.update.mockResolvedValue(undefined);

      await service.updateLastLogin('user-1');

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });
  });

  describe('updateProfilePicture', () => {
    const mockFile = {
      originalname: 'avatar.png',
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
      size: 4,
    } as Express.Multer.File;

    it('should upload and update profile picture', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUserNoPicture });
      minioService.uploadFile.mockResolvedValue('avatars/user-2/avatar.png');
      const saved = {
        ...mockUserNoPicture,
        profilePicture: 'avatars/user-2/avatar.png',
      };
      userRepository.save.mockResolvedValue(saved as User);
      minioService.getFileUrl.mockReturnValue(
        'http://minio/avatars/user-2/avatar.png',
      );

      const result = await service.updateProfilePicture('user-2', mockFile);

      expect(minioService.uploadFile).toHaveBeenCalledWith(
        mockFile,
        'avatars/user-2',
      );
      expect((result as any).profilePictureUrl).toBe(
        'http://minio/avatars/user-2/avatar.png',
      );
    });

    it('should delete old picture before uploading new one', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      minioService.uploadFile.mockResolvedValue('avatars/user-1/new.png');
      const saved = { ...mockUser, profilePicture: 'avatars/user-1/new.png' };
      userRepository.save.mockResolvedValue(saved as User);
      minioService.getFileUrl.mockReturnValue(
        'http://minio/avatars/user-1/new.png',
      );

      await service.updateProfilePicture('user-1', mockFile);

      expect(minioService.deleteFile).toHaveBeenCalledWith(
        mockUser.profilePicture,
      );
    });

    it('should still upload if deleteFile throws', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      minioService.deleteFile.mockRejectedValue(new Error('Not found'));
      minioService.uploadFile.mockResolvedValue('avatars/user-1/new.png');
      const saved = { ...mockUser, profilePicture: 'avatars/user-1/new.png' };
      userRepository.save.mockResolvedValue(saved as User);
      minioService.getFileUrl.mockReturnValue(
        'http://minio/avatars/user-1/new.png',
      );

      const result = await service.updateProfilePicture('user-1', mockFile);

      expect(minioService.uploadFile).toHaveBeenCalled();
      expect((result as any).profilePictureUrl).toBe(
        'http://minio/avatars/user-1/new.png',
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfilePicture('nonexistent', mockFile),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      userRepository.delete.mockResolvedValue(undefined);

      await service.remove('user-1');

      expect(userRepository.delete).toHaveBeenCalledWith('user-1');
    });
  });
});
