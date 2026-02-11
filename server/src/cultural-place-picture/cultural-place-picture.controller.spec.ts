import { Test, TestingModule } from '@nestjs/testing';
import { CulturalPlacePictureController } from './cultural-place-picture.controller';
import { CulturalPlacePictureService } from './cultural-place-picture.service';
import { AuthGuard } from '../user/auth.guard';

describe('CulturalPlacePictureController', () => {
  let controller: CulturalPlacePictureController;
  let service: jest.Mocked<CulturalPlacePictureService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturalPlacePictureController],
      providers: [
        {
          provide: CulturalPlacePictureService,
          useValue: {
            findByCulturalPlaceId: jest.fn(),
            upload: jest.fn(),
            setMainPicture: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CulturalPlacePictureController>(CulturalPlacePictureController);
    service = module.get(CulturalPlacePictureService);
  });

  describe('findAll', () => {
    it('should call service.findByCulturalPlaceId()', async () => {
      const expected = [{ id: '1', url: 'http://url' }];
      service.findByCulturalPlaceId.mockResolvedValue(expected as any);

      const result = await controller.findAll('place-1');

      expect(service.findByCulturalPlaceId).toHaveBeenCalledWith('place-1');
      expect(result).toEqual(expected);
    });
  });

  describe('upload', () => {
    it('should call service.upload() with mainPicture=true', async () => {
      const file = { originalname: 'pic.png' } as Express.Multer.File;
      const expected = { id: '1', url: 'http://url' };
      service.upload.mockResolvedValue(expected as any);

      const result = await controller.upload('place-1', file, 'true');

      expect(service.upload).toHaveBeenCalledWith('place-1', file, true);
      expect(result).toEqual(expected);
    });

    it('should call service.upload() with mainPicture=false when not "true"', async () => {
      const file = { originalname: 'pic.png' } as Express.Multer.File;
      service.upload.mockResolvedValue({} as any);

      await controller.upload('place-1', file, 'false');

      expect(service.upload).toHaveBeenCalledWith('place-1', file, false);
    });
  });

  describe('setMainPicture', () => {
    it('should call service.setMainPicture(id)', async () => {
      const expected = { id: '1', mainPicture: true };
      service.setMainPicture.mockResolvedValue(expected as any);

      const result = await controller.setMainPicture('1');

      expect(service.setMainPicture).toHaveBeenCalledWith('1');
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should call service.delete(id)', async () => {
      service.delete.mockResolvedValue(undefined);

      await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith('1');
    });
  });
});
