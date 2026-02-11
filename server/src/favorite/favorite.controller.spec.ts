import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { AuthGuard } from '../user/auth.guard';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: jest.Mocked<FavoriteService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        {
          provide: FavoriteService,
          useValue: {
            findUserFavorites: jest.fn(),
            addFavorite: jest.fn(),
            removeFavorite: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get(FavoriteService);
  });

  describe('findMyFavorites', () => {
    it('should extract userId and call service.findUserFavorites()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = [{ id: 'fav-1' }];
      service.findUserFavorites.mockResolvedValue(expected as any);

      const result = await controller.findMyFavorites(req);

      expect(service.findUserFavorites).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('addFavorite', () => {
    it('should extract userId and call service.addFavorite()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = { id: 'fav-1' };
      service.addFavorite.mockResolvedValue(expected as any);

      const result = await controller.addFavorite('place-1', req);

      expect(service.addFavorite).toHaveBeenCalledWith('user-1', 'place-1');
      expect(result).toEqual(expected);
    });
  });

  describe('removeFavorite', () => {
    it('should extract userId and call service.removeFavorite()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      service.removeFavorite.mockResolvedValue(undefined);

      await controller.removeFavorite('place-1', req);

      expect(service.removeFavorite).toHaveBeenCalledWith('user-1', 'place-1');
    });
  });
});
