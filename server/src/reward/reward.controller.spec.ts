import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { AuthGuard } from '../user/auth.guard';

describe('RewardController', () => {
  let controller: RewardController;
  let rewardService: jest.Mocked<RewardService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [
        {
          provide: RewardService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            uploadImage: jest.fn(),
            purchase: jest.fn(),
            findUserRewards: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RewardController>(RewardController);
    rewardService = module.get(RewardService);
  });

  describe('findAll', () => {
    it('should call rewardService.findAll()', async () => {
      const expected = [{ id: '1', title: 'R', imageUrl: null }];
      rewardService.findAll.mockResolvedValue(expected as any);

      const result = await controller.findAll();

      expect(rewardService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call rewardService.create(dto)', async () => {
      const dto = { title: 'New', cost: 100 };
      const expected = { id: '1', ...dto };
      rewardService.create.mockResolvedValue(expected as any);

      const result = await controller.create(dto);

      expect(rewardService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('uploadImage', () => {
    it('should call rewardService.uploadImage(id, file)', async () => {
      const file = { originalname: 'test.png' } as Express.Multer.File;
      const expected = { id: '1', imageUrl: 'http://url' };
      rewardService.uploadImage.mockResolvedValue(expected as any);

      const result = await controller.uploadImage('1', file);

      expect(rewardService.uploadImage).toHaveBeenCalledWith('1', file);
      expect(result).toEqual(expected);
    });
  });

  describe('purchase', () => {
    it('should extract userId from req and call rewardService.purchase()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = { id: 'ur-1' };
      rewardService.purchase.mockResolvedValue(expected as any);

      const result = await controller.purchase('reward-1', req);

      expect(rewardService.purchase).toHaveBeenCalledWith('user-1', 'reward-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findMyRewards', () => {
    it('should extract userId from req and call rewardService.findUserRewards()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = [{ id: 'ur-1' }];
      rewardService.findUserRewards.mockResolvedValue(expected as any);

      const result = await controller.findMyRewards(req);

      expect(rewardService.findUserRewards).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });
});
