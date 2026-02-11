import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteRepository } from './favorite.repository';
import { Favorite } from './favorite.entity';

describe('FavoriteService', () => {
  let service: FavoriteService;
  let favoriteRepository: jest.Mocked<FavoriteRepository>;

  const mockFavorite = {
    id: 'fav-1',
    user: { id: 'user-1' },
    culturalPlace: { id: 'place-1' },
    createdAt: new Date(),
  } as unknown as Favorite;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: FavoriteRepository,
          useValue: {
            findByUserId: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
    favoriteRepository = module.get(FavoriteRepository);
  });

  describe('findUserFavorites', () => {
    it('should return user favorites', async () => {
      favoriteRepository.findByUserId.mockResolvedValue([mockFavorite]);

      const result = await service.findUserFavorites('user-1');

      expect(favoriteRepository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([mockFavorite]);
    });

    it('should return empty array if no favorites', async () => {
      favoriteRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findUserFavorites('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should create and save a favorite', async () => {
      favoriteRepository.findOne.mockResolvedValue(null);
      favoriteRepository.create.mockReturnValue(mockFavorite);
      favoriteRepository.save.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite('user-1', 'place-1');

      expect(favoriteRepository.create).toHaveBeenCalledWith('user-1', 'place-1');
      expect(favoriteRepository.save).toHaveBeenCalledWith(mockFavorite);
      expect(result).toEqual(mockFavorite);
    });

    it('should throw ConflictException if already favorited', async () => {
      favoriteRepository.findOne.mockResolvedValue(mockFavorite);

      await expect(service.addFavorite('user-1', 'place-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeFavorite', () => {
    it('should delete the favorite', async () => {
      favoriteRepository.findOne.mockResolvedValue(mockFavorite);
      favoriteRepository.delete.mockResolvedValue(undefined);

      await service.removeFavorite('user-1', 'place-1');

      expect(favoriteRepository.delete).toHaveBeenCalledWith('fav-1');
    });

    it('should throw NotFoundException if favorite does not exist', async () => {
      favoriteRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFavorite('user-1', 'place-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
