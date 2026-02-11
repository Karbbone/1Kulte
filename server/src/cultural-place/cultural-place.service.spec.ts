import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CulturalPlaceService } from './cultural-place.service';
import { CulturalPlaceRepository } from './cultural-place.repository';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceType } from './cultural-place-type.enum';
import { Favorite } from '../favorite/favorite.entity';

describe('CulturalPlaceService', () => {
  let service: CulturalPlaceService;
  let culturalPlaceRepository: jest.Mocked<CulturalPlaceRepository>;
  let favoriteRepository: jest.Mocked<any>;

  const mockPlace: CulturalPlace = {
    id: 'place-1',
    name: 'Louvre',
    description: 'Museum',
    postCode: '75001',
    city: 'Paris',
    latitude: 48.8606,
    longitude: 2.3376,
    type: CulturalPlaceType.ART,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalPlaceService,
        {
          provide: CulturalPlaceRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findPopular: jest.fn(),
            findRandom: jest.fn(),
            findByTypesExcludingIds: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Favorite),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CulturalPlaceService>(CulturalPlaceService);
    culturalPlaceRepository = module.get(CulturalPlaceRepository);
    favoriteRepository = module.get(getRepositoryToken(Favorite));
  });

  describe('findAll', () => {
    it('should return all cultural places', async () => {
      culturalPlaceRepository.findAll.mockResolvedValue([mockPlace]);

      const result = await service.findAll();

      expect(result).toEqual([mockPlace]);
    });

    it('should return empty array', async () => {
      culturalPlaceRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a cultural place', async () => {
      culturalPlaceRepository.findOne.mockResolvedValue(mockPlace);

      const result = await service.findOne('place-1');

      expect(result).toEqual(mockPlace);
    });

    it('should return null if not found', async () => {
      culturalPlaceRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a cultural place', async () => {
      const dto = { name: 'New', postCode: '75001', city: 'Paris', type: CulturalPlaceType.ART };
      culturalPlaceRepository.create.mockReturnValue(mockPlace);
      culturalPlaceRepository.save.mockResolvedValue(mockPlace);

      const result = await service.create(dto as any);

      expect(culturalPlaceRepository.create).toHaveBeenCalledWith(dto);
      expect(culturalPlaceRepository.save).toHaveBeenCalledWith(mockPlace);
      expect(result).toEqual(mockPlace);
    });
  });

  describe('update', () => {
    it('should update and return the cultural place', async () => {
      const updated = { ...mockPlace, name: 'Updated' };
      culturalPlaceRepository.update.mockResolvedValue(undefined);
      culturalPlaceRepository.findOne.mockResolvedValue(updated);

      const result = await service.update('place-1', { name: 'Updated' } as any);

      expect(culturalPlaceRepository.update).toHaveBeenCalledWith('place-1', { name: 'Updated' });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete the cultural place', async () => {
      culturalPlaceRepository.delete.mockResolvedValue(undefined);

      await service.remove('place-1');

      expect(culturalPlaceRepository.delete).toHaveBeenCalledWith('place-1');
    });
  });

  describe('findPopular', () => {
    it('should return popular places with favoriteCount', async () => {
      const popular = [{ ...mockPlace, favoriteCount: 10 }];
      culturalPlaceRepository.findPopular.mockResolvedValue(popular as any);

      const result = await service.findPopular(5);

      expect(culturalPlaceRepository.findPopular).toHaveBeenCalledWith(5);
      expect(result[0].favoriteCount).toBe(10);
    });
  });

  describe('findRecommendations', () => {
    it('should return random places if user has no favorites', async () => {
      favoriteRepository.find.mockResolvedValue([]);
      culturalPlaceRepository.findRandom.mockResolvedValue([mockPlace]);

      const result = await service.findRecommendations('user-1', 5);

      expect(culturalPlaceRepository.findRandom).toHaveBeenCalledWith(5);
      expect(result).toEqual([mockPlace]);
    });

    it('should return recommendations based on preferred types', async () => {
      const favorites = [
        { culturalPlace: { id: 'place-1', type: CulturalPlaceType.ART } },
        { culturalPlace: { id: 'place-2', type: CulturalPlaceType.ART } },
      ];
      favoriteRepository.find.mockResolvedValue(favorites);
      const recommended = [{ ...mockPlace, id: 'place-3' }];
      culturalPlaceRepository.findByTypesExcludingIds.mockResolvedValue(recommended as any);

      const result = await service.findRecommendations('user-1', 5);

      expect(culturalPlaceRepository.findByTypesExcludingIds).toHaveBeenCalledWith(
        [CulturalPlaceType.ART],
        ['place-1', 'place-2'],
        5,
      );
      expect(result).toEqual(recommended);
    });

    it('should fill with additional places if not enough recommendations', async () => {
      const favorites = [
        { culturalPlace: { id: 'place-1', type: CulturalPlaceType.MUSIQUE } },
      ];
      favoriteRepository.find.mockResolvedValue(favorites);
      const partial = [{ ...mockPlace, id: 'place-2' }];
      const additional = [{ ...mockPlace, id: 'place-3' }];
      culturalPlaceRepository.findByTypesExcludingIds
        .mockResolvedValueOnce(partial as any)
        .mockResolvedValueOnce(additional as any);

      const result = await service.findRecommendations('user-1', 5);

      expect(result).toHaveLength(2);
    });
  });
});
