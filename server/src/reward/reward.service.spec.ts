import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RewardService } from './reward.service';
import { RewardRepository } from './reward.repository';
import { UserRewardRepository } from './user-reward.repository';
import { UserRepository } from '../user/user.repository';
import { MinioService } from 'src/shares/minio/minio.service';
import { Reward } from './reward.entity';
import { UserReward } from './user-reward.entity';
import { User } from '../user/user.entity';

describe('RewardService', () => {
  let service: RewardService;
  let rewardRepository: jest.Mocked<RewardRepository>;
  let userRewardRepository: jest.Mocked<UserRewardRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let minioService: jest.Mocked<MinioService>;

  const mockReward: Reward = {
    id: 'reward-1',
    title: 'Test Reward',
    description: 'A test reward',
    cost: 100,
    image: 'rewards/reward-1/image.png',
    userRewards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRewardNoImage: Reward = {
    id: 'reward-2',
    title: 'No Image Reward',
    description: 'A reward without image',
    cost: 50,
    image: null,
    userRewards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'hashed',
    newsletter: false,
    birthDate: null,
    emailVerified: true,
    points: 200,
    profilePicture: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: RewardRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserRewardRepository,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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

    service = module.get<RewardService>(RewardService);
    rewardRepository = module.get(RewardRepository);
    userRewardRepository = module.get(UserRewardRepository);
    userRepository = module.get(UserRepository);
    minioService = module.get(MinioService);
  });

  describe('findAll', () => {
    it('should return rewards with imageUrl', async () => {
      rewardRepository.findAll.mockResolvedValue([mockReward]);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-1/image.png');

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toBe('http://minio/rewards/reward-1/image.png');
      expect(rewardRepository.findAll).toHaveBeenCalled();
    });

    it('should return imageUrl: null if reward has no image', async () => {
      rewardRepository.findAll.mockResolvedValue([mockRewardNoImage]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toBeNull();
      expect(minioService.getFileUrl).not.toHaveBeenCalled();
    });

    it('should return an empty array when no rewards exist', async () => {
      rewardRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle mix of rewards with and without image', async () => {
      rewardRepository.findAll.mockResolvedValue([mockReward, mockRewardNoImage]);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-1/image.png');

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].imageUrl).toBe('http://minio/rewards/reward-1/image.png');
      expect(result[1].imageUrl).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return the reward with imageUrl', async () => {
      rewardRepository.findOne.mockResolvedValue(mockReward);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-1/image.png');

      const result = await service.findOne('reward-1');

      expect(result).toBeDefined();
      expect(result.imageUrl).toBe('http://minio/rewards/reward-1/image.png');
    });

    it('should return null if reward does not exist', async () => {
      rewardRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });

    it('should return imageUrl: null if reward has no image', async () => {
      rewardRepository.findOne.mockResolvedValue(mockRewardNoImage);

      const result = await service.findOne('reward-2');

      expect(result).toBeDefined();
      expect(result.imageUrl).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a reward', async () => {
      const dto = { title: 'New Reward', cost: 150 };
      const created = { ...mockReward, ...dto } as Reward;
      rewardRepository.create.mockReturnValue(created);
      rewardRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(rewardRepository.create).toHaveBeenCalledWith(dto);
      expect(rewardRepository.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('uploadImage', () => {
    const mockFile = {
      originalname: 'test.png',
      buffer: Buffer.from('test'),
      mimetype: 'image/png',
      size: 4,
    } as Express.Multer.File;

    it('should upload file and update the reward', async () => {
      rewardRepository.findOne.mockResolvedValue({ ...mockRewardNoImage });
      minioService.uploadFile.mockResolvedValue('rewards/reward-2/test.png');
      const savedReward = { ...mockRewardNoImage, image: 'rewards/reward-2/test.png' };
      rewardRepository.save.mockResolvedValue(savedReward as Reward);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-2/test.png');

      const result = await service.uploadImage('reward-2', mockFile);

      expect(minioService.uploadFile).toHaveBeenCalledWith(mockFile, 'rewards/reward-2');
      expect(result.imageUrl).toBe('http://minio/rewards/reward-2/test.png');
    });

    it('should delete old image if it exists', async () => {
      rewardRepository.findOne.mockResolvedValue({ ...mockReward });
      minioService.uploadFile.mockResolvedValue('rewards/reward-1/new.png');
      const savedReward = { ...mockReward, image: 'rewards/reward-1/new.png' };
      rewardRepository.save.mockResolvedValue(savedReward as Reward);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-1/new.png');

      await service.uploadImage('reward-1', mockFile);

      expect(minioService.deleteFile).toHaveBeenCalledWith(mockReward.image);
    });

    it('should still upload even if deleteFile throws', async () => {
      rewardRepository.findOne.mockResolvedValue({ ...mockReward });
      minioService.deleteFile.mockRejectedValue(new Error('File not found'));
      minioService.uploadFile.mockResolvedValue('rewards/reward-1/new.png');
      const savedReward = { ...mockReward, image: 'rewards/reward-1/new.png' };
      rewardRepository.save.mockResolvedValue(savedReward as Reward);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-1/new.png');

      const result = await service.uploadImage('reward-1', mockFile);

      expect(minioService.deleteFile).toHaveBeenCalled();
      expect(minioService.uploadFile).toHaveBeenCalled();
      expect(result.imageUrl).toBe('http://minio/rewards/reward-1/new.png');
    });

    it('should throw NotFoundException if reward does not exist', async () => {
      rewardRepository.findOne.mockResolvedValue(null);

      await expect(service.uploadImage('nonexistent', mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('purchase', () => {
    it('should deduct points and create a UserReward', async () => {
      const user = { ...mockUser, points: 200 };
      userRepository.findOne.mockResolvedValue(user);
      rewardRepository.findOne.mockResolvedValue(mockReward);
      const userReward = { id: 'ur-1', user, reward: mockReward } as unknown as UserReward;
      userRewardRepository.create.mockReturnValue(userReward);
      userRewardRepository.save.mockResolvedValue(userReward);

      const result = await service.purchase('user-1', 'reward-1');

      expect(user.points).toBe(100);
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(userRewardRepository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        rewardId: 'reward-1',
      });
      expect(result).toEqual(userReward);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.purchase('nonexistent', 'reward-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if reward does not exist', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      rewardRepository.findOne.mockResolvedValue(null);

      await expect(service.purchase('user-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if insufficient points', async () => {
      const poorUser = { ...mockUser, points: 10 };
      userRepository.findOne.mockResolvedValue(poorUser);
      rewardRepository.findOne.mockResolvedValue(mockReward);

      await expect(service.purchase('user-1', 'reward-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should succeed when points exactly equal cost', async () => {
      const exactUser = { ...mockUser, points: 100 };
      userRepository.findOne.mockResolvedValue(exactUser);
      rewardRepository.findOne.mockResolvedValue(mockReward);
      const userReward = { id: 'ur-1' } as unknown as UserReward;
      userRewardRepository.create.mockReturnValue(userReward);
      userRewardRepository.save.mockResolvedValue(userReward);

      await service.purchase('user-1', 'reward-1');

      expect(exactUser.points).toBe(0);
      expect(userRepository.save).toHaveBeenCalledWith(exactUser);
    });
  });

  describe('findUserRewards', () => {
    it('should return user rewards with imageUrl on each reward', async () => {
      const userRewards = [
        {
          id: 'ur-1',
          reward: { ...mockReward },
          createdAt: new Date(),
        },
      ] as unknown as UserReward[];
      userRewardRepository.findByUserId.mockResolvedValue(userRewards);
      minioService.getFileUrl.mockReturnValue('http://minio/rewards/reward-1/image.png');

      const result = await service.findUserRewards('user-1');

      expect(userRewardRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect((result[0].reward as any).imageUrl).toBe(
        'http://minio/rewards/reward-1/image.png',
      );
    });

    it('should return an empty array when user has no rewards', async () => {
      userRewardRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findUserRewards('user-1');

      expect(result).toEqual([]);
    });

    it('should handle reward without image in user rewards', async () => {
      const userRewards = [
        {
          id: 'ur-1',
          reward: { ...mockRewardNoImage },
          createdAt: new Date(),
        },
      ] as unknown as UserReward[];
      userRewardRepository.findByUserId.mockResolvedValue(userRewards);

      const result = await service.findUserRewards('user-1');

      expect((result[0].reward as any).imageUrl).toBeNull();
    });
  });
});
