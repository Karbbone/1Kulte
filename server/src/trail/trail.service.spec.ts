import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrailService } from './trail.service';
import { TrailRepository } from './trail.repository';
import { Trail } from './trail.entity';

describe('TrailService', () => {
  let service: TrailService;
  let trailRepository: jest.Mocked<TrailRepository>;

  const mockTrail = {
    id: 'trail-1',
    name: 'Art Trail',
    description: 'A trail about art',
    durationMinute: 30,
    difficulty: 'easy',
    isActive: true,
    culturalPlace: { id: 'place-1', name: 'Louvre' },
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Trail;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrailService,
        {
          provide: TrailRepository,
          useValue: {
            findAll: jest.fn(),
            findByCulturalPlaceId: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TrailService>(TrailService);
    trailRepository = module.get(TrailRepository);
  });

  describe('findAll', () => {
    it('should return all trails', async () => {
      trailRepository.findAll.mockResolvedValue([mockTrail]);

      const result = await service.findAll();

      expect(result).toEqual([mockTrail]);
    });
  });

  describe('findByCulturalPlaceId', () => {
    it('should return trails for a cultural place', async () => {
      trailRepository.findByCulturalPlaceId.mockResolvedValue([mockTrail]);

      const result = await service.findByCulturalPlaceId('place-1');

      expect(trailRepository.findByCulturalPlaceId).toHaveBeenCalledWith('place-1');
      expect(result).toEqual([mockTrail]);
    });

    it('should return empty array if no trails', async () => {
      trailRepository.findByCulturalPlaceId.mockResolvedValue([]);

      const result = await service.findByCulturalPlaceId('place-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a trail', async () => {
      trailRepository.findOne.mockResolvedValue(mockTrail);

      const result = await service.findOne('trail-1');

      expect(result).toEqual(mockTrail);
    });

    it('should throw NotFoundException if trail not found', async () => {
      trailRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and save a trail', async () => {
      const dto = { name: 'New Trail', culturalPlaceId: 'place-1' };
      trailRepository.create.mockReturnValue(mockTrail);
      trailRepository.save.mockResolvedValue(mockTrail);

      const result = await service.create(dto as any);

      expect(trailRepository.create).toHaveBeenCalledWith({
        ...dto,
        culturalPlace: { id: 'place-1' },
      });
      expect(result).toEqual(mockTrail);
    });
  });

  describe('update', () => {
    it('should update and return the trail', async () => {
      trailRepository.findOne.mockResolvedValue(mockTrail);
      trailRepository.update.mockResolvedValue(undefined);

      const result = await service.update('trail-1', { name: 'Updated' } as any);

      expect(trailRepository.update).toHaveBeenCalledWith('trail-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if trail not found', async () => {
      trailRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'X' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the trail', async () => {
      trailRepository.findOne.mockResolvedValue(mockTrail);
      trailRepository.delete.mockResolvedValue(undefined);

      await service.remove('trail-1');

      expect(trailRepository.delete).toHaveBeenCalledWith('trail-1');
    });

    it('should throw NotFoundException if trail not found', async () => {
      trailRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
