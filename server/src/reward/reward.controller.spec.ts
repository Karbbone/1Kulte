import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
            getCart: jest.fn(),
            getNearbyRelayPoints: jest.fn(),
            addToCart: jest.fn(),
            updateCartItemQuantity: jest.fn(),
            removeCartItem: jest.fn(),
            updateCartDelivery: jest.fn(),
            updateCartWalletDiscount: jest.fn(),
            checkoutCart: jest.fn(),
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

  describe('cart endpoints', () => {
    const req = { user: { user: { id: 'user-1' } } } as any;

    it('should call rewardService.getCart(userId)', async () => {
      const expected = { id: 'cart-1', items: [] };
      rewardService.getCart.mockResolvedValue(expected as any);

      const result = await controller.getCart(req);

      expect(rewardService.getCart).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });

    it('should call rewardService.addToCart(userId, body)', async () => {
      const body = { rewardId: 'reward-1', quantity: 2 };
      const expected = { id: 'cart-1' };
      rewardService.addToCart.mockResolvedValue(expected as any);

      const result = await controller.addToCart(req, body as any);

      expect(rewardService.addToCart).toHaveBeenCalledWith('user-1', body);
      expect(result).toEqual(expected);
    });

    it('should call rewardService.updateCartItemQuantity(userId, itemId, body)', async () => {
      const body = { quantity: 3 };
      const expected = { id: 'cart-1' };
      rewardService.updateCartItemQuantity.mockResolvedValue(expected as any);

      const result = await controller.updateCartItem(req, 'item-1', body as any);

      expect(rewardService.updateCartItemQuantity).toHaveBeenCalledWith(
        'user-1',
        'item-1',
        body,
      );
      expect(result).toEqual(expected);
    });

    it('should call rewardService.removeCartItem(userId, itemId)', async () => {
      const expected = { id: 'cart-1' };
      rewardService.removeCartItem.mockResolvedValue(expected as any);

      const result = await controller.removeCartItem(req, 'item-1');

      expect(rewardService.removeCartItem).toHaveBeenCalledWith('user-1', 'item-1');
      expect(result).toEqual(expected);
    });

    it('should call rewardService.updateCartDelivery(userId, body)', async () => {
      const body = {
        deliveryMode: 'relay',
        relayPointName: 'Relay A',
        relayAddress: 'Rue A',
      };
      const expected = { id: 'cart-1' };
      rewardService.updateCartDelivery.mockResolvedValue(expected as any);

      const result = await controller.updateCartDelivery(req, body as any);

      expect(rewardService.updateCartDelivery).toHaveBeenCalledWith('user-1', body);
      expect(result).toEqual(expected);
    });

    it('should call rewardService.updateCartWalletDiscount(userId, body)', async () => {
      const body = { useWalletDiscount: false };
      const expected = { id: 'cart-1' };
      rewardService.updateCartWalletDiscount.mockResolvedValue(expected as any);

      const result = await controller.updateCartWalletDiscount(req, body as any);

      expect(rewardService.updateCartWalletDiscount).toHaveBeenCalledWith(
        'user-1',
        body,
      );
      expect(result).toEqual(expected);
    });

    it('should call rewardService.checkoutCart(userId)', async () => {
      const expected = { purchasedCount: 2, total: 20 };
      rewardService.checkoutCart.mockResolvedValue(expected as any);

      const result = await controller.checkoutCart(req);

      expect(rewardService.checkoutCart).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('getNearbyRelayPoints', () => {
    it('should call rewardService.getNearbyRelayPoints(lat, lng)', () => {
      const query = { latitude: 47.6582, longitude: -2.7617 };
      const expected = [
        {
          id: 'relay-vannes-centre',
          name: 'Mondial Relay Vannes Centre',
          address: '14 Rue Thiers, 56000 Vannes',
          latitude: 47.6582,
          longitude: -2.7617,
          distanceKm: 0,
        },
      ];
      rewardService.getNearbyRelayPoints.mockReturnValue(expected as any);

      const result = controller.getNearbyRelayPoints(query as any);

      expect(rewardService.getNearbyRelayPoints).toHaveBeenCalledWith(
        query.latitude,
        query.longitude,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return reward when found', async () => {
      const expected = { id: 'reward-1' };
      rewardService.findOne.mockResolvedValue(expected as any);

      const result = await controller.findOne('reward-1');

      expect(rewardService.findOne).toHaveBeenCalledWith('reward-1');
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when reward is missing', async () => {
      rewardService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
