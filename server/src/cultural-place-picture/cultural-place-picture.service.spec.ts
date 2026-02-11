import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  CulturalPlacePictureService,
} from './cultural-place-picture.service';
import { CulturalPlacePictureRepository } from './cultural-place-picture.repository';
import { MinioService } from 'src/shares/minio/minio.service';
import { CulturalPlacePicture } from './cultural-place-picture.entity';

describe('CulturalPlacePictureService', () => {
  let service: CulturalPlacePictureService;
  let pictureRepository: jest.Mocked<CulturalPlacePictureRepository>;
  let minioService: jest.Mocked<MinioService>;

  const mockPicture = {
    id: 'pic-1',
    name: 'photo.jpg',
    path: 'cultural-places/place-1/photo.jpg',
    mainPicture: false,
    culturalPlace: { id: 'place-1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as CulturalPlacePicture;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalPlacePictureService,
        {
          provide: CulturalPlacePictureRepository,
          useValue: {
            findByCulturalPlaceId: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            removeMainPicture: jest.fn(),
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

    service = module.get<CulturalPlacePictureService>(CulturalPlacePictureService);
    pictureRepository = module.get(CulturalPlacePictureRepository);
    minioService = module.get(MinioService);
  });

  describe('findByCulturalPlaceId', () => {
    it('should return pictures with URLs', async () => {
      pictureRepository.findByCulturalPlaceId.mockResolvedValue([mockPicture]);
      minioService.getFileUrl.mockReturnValue('http://minio/cultural-places/place-1/photo.jpg');

      const result = await service.findByCulturalPlaceId('place-1');

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('http://minio/cultural-places/place-1/photo.jpg');
    });

    it('should return empty array if no pictures', async () => {
      pictureRepository.findByCulturalPlaceId.mockResolvedValue([]);

      const result = await service.findByCulturalPlaceId('place-1');

      expect(result).toEqual([]);
    });
  });

  describe('upload', () => {
    const mockFile = {
      originalname: 'photo.jpg',
      buffer: Buffer.from('test'),
      mimetype: 'image/jpeg',
      size: 4,
    } as Express.Multer.File;

    it('should upload file and create picture record', async () => {
      minioService.uploadFile.mockResolvedValue('cultural-places/place-1/photo.jpg');
      pictureRepository.create.mockReturnValue(mockPicture);
      pictureRepository.save.mockResolvedValue(mockPicture);
      minioService.getFileUrl.mockReturnValue('http://minio/cultural-places/place-1/photo.jpg');

      const result = await service.upload('place-1', mockFile);

      expect(minioService.uploadFile).toHaveBeenCalledWith(mockFile, 'cultural-places/place-1');
      expect(result.url).toBe('http://minio/cultural-places/place-1/photo.jpg');
    });

    it('should remove previous main picture if mainPicture is true', async () => {
      minioService.uploadFile.mockResolvedValue('cultural-places/place-1/photo.jpg');
      pictureRepository.create.mockReturnValue(mockPicture);
      pictureRepository.save.mockResolvedValue(mockPicture);
      minioService.getFileUrl.mockReturnValue('http://url');

      await service.upload('place-1', mockFile, true);

      expect(pictureRepository.removeMainPicture).toHaveBeenCalledWith('place-1');
    });

    it('should not remove main picture if mainPicture is false', async () => {
      minioService.uploadFile.mockResolvedValue('cultural-places/place-1/photo.jpg');
      pictureRepository.create.mockReturnValue(mockPicture);
      pictureRepository.save.mockResolvedValue(mockPicture);
      minioService.getFileUrl.mockReturnValue('http://url');

      await service.upload('place-1', mockFile, false);

      expect(pictureRepository.removeMainPicture).not.toHaveBeenCalled();
    });
  });

  describe('setMainPicture', () => {
    it('should set picture as main and return with URL', async () => {
      pictureRepository.findOne.mockResolvedValue(mockPicture);
      pictureRepository.removeMainPicture.mockResolvedValue(undefined);
      pictureRepository.update.mockResolvedValue(undefined);
      minioService.getFileUrl.mockReturnValue('http://minio/cultural-places/place-1/photo.jpg');

      const result = await service.setMainPicture('pic-1');

      expect(pictureRepository.removeMainPicture).toHaveBeenCalledWith('place-1');
      expect(pictureRepository.update).toHaveBeenCalledWith('pic-1', { mainPicture: true });
      expect(result.mainPicture).toBe(true);
      expect(result.url).toBe('http://minio/cultural-places/place-1/photo.jpg');
    });

    it('should throw NotFoundException if picture not found', async () => {
      pictureRepository.findOne.mockResolvedValue(null);

      await expect(service.setMainPicture('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete file from Minio and database', async () => {
      pictureRepository.findOne.mockResolvedValue(mockPicture);
      minioService.deleteFile.mockResolvedValue(undefined);
      pictureRepository.delete.mockResolvedValue(undefined);

      await service.delete('pic-1');

      expect(minioService.deleteFile).toHaveBeenCalledWith(mockPicture.path);
      expect(pictureRepository.delete).toHaveBeenCalledWith('pic-1');
    });

    it('should throw NotFoundException if picture not found', async () => {
      pictureRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFileUrl', () => {
    it('should delegate to minioService.getFileUrl', () => {
      minioService.getFileUrl.mockReturnValue('http://minio/path');

      const result = service.getFileUrl('path');

      expect(result).toBe('http://minio/path');
    });
  });
});
