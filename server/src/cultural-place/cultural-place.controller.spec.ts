import { Test, TestingModule } from '@nestjs/testing';
import { CulturalPlaceController } from './cultural-place.controller';
import { CulturalPlaceService } from './cultural-place.service';
import { AuthGuard } from '../user/auth.guard';

describe('CulturalPlaceController', () => {
  let controller: CulturalPlaceController;
  let service: jest.Mocked<CulturalPlaceService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturalPlaceController],
      providers: [
        {
          provide: CulturalPlaceService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findPopular: jest.fn(),
            findRecommendations: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CulturalPlaceController>(CulturalPlaceController);
    service = module.get(CulturalPlaceService);
  });

  describe('findAll', () => {
    it('should call service.findAll()', async () => {
      const expected = [{ id: '1' }];
      service.findAll.mockResolvedValue(expected as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findPopular', () => {
    it('should call service.findPopular(5)', async () => {
      const expected = [{ id: '1', favoriteCount: 10 }];
      service.findPopular.mockResolvedValue(expected as any);

      const result = await controller.findPopular();

      expect(service.findPopular).toHaveBeenCalledWith(5);
      expect(result).toEqual(expected);
    });
  });

  describe('findRecommendations', () => {
    it('should extract userId and call service.findRecommendations()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = [{ id: '1' }];
      service.findRecommendations.mockResolvedValue(expected as any);

      const result = await controller.findRecommendations(req);

      expect(service.findRecommendations).toHaveBeenCalledWith('user-1', 5);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne(id)', async () => {
      const expected = { id: '1' };
      service.findOne.mockResolvedValue(expected as any);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call service.create(dto)', async () => {
      const dto = { name: 'New' };
      const expected = { id: '1', name: 'New' };
      service.create.mockResolvedValue(expected as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call service.update(id, dto)', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: '1', name: 'Updated' };
      service.update.mockResolvedValue(expected as any);

      const result = await controller.update('1', dto as any);

      expect(service.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove(id)', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
