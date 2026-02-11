import { Test, TestingModule } from '@nestjs/testing';
import { TrailController } from './trail.controller';
import { TrailService } from './trail.service';
import { QRCodeService } from './qrcode.service';
import { AuthGuard } from '../user/auth.guard';

describe('TrailController', () => {
  let controller: TrailController;
  let trailService: jest.Mocked<TrailService>;
  let qrCodeService: jest.Mocked<QRCodeService>;

  const mockTrail = {
    id: 'trail-1',
    name: 'Art Trail',
    description: 'desc',
    durationMinute: 30,
    difficulty: 'easy',
    culturalPlace: { id: 'place-1', name: 'Louvre' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrailController],
      providers: [
        {
          provide: TrailService,
          useValue: {
            findAll: jest.fn(),
            findByCulturalPlaceId: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: QRCodeService,
          useValue: {
            generateQRCodeDataURL: jest.fn(),
            generateQRCodeBuffer: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TrailController>(TrailController);
    trailService = module.get(TrailService);
    qrCodeService = module.get(QRCodeService);
  });

  describe('findAll', () => {
    it('should call trailService.findAll()', async () => {
      trailService.findAll.mockResolvedValue([mockTrail]);

      const result = await controller.findAll();

      expect(trailService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockTrail]);
    });
  });

  describe('findByCulturalPlace', () => {
    it('should call trailService.findByCulturalPlaceId()', async () => {
      trailService.findByCulturalPlaceId.mockResolvedValue([mockTrail]);

      const result = await controller.findByCulturalPlace('place-1');

      expect(trailService.findByCulturalPlaceId).toHaveBeenCalledWith('place-1');
      expect(result).toEqual([mockTrail]);
    });
  });

  describe('findOne', () => {
    it('should call trailService.findOne(id)', async () => {
      trailService.findOne.mockResolvedValue(mockTrail);

      const result = await controller.findOne('trail-1');

      expect(trailService.findOne).toHaveBeenCalledWith('trail-1');
      expect(result).toEqual(mockTrail);
    });
  });

  describe('create', () => {
    it('should call trailService.create(dto)', async () => {
      const dto = { name: 'New', culturalPlaceId: 'place-1' };
      trailService.create.mockResolvedValue(mockTrail);

      const result = await controller.create(dto as any);

      expect(trailService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTrail);
    });
  });

  describe('update', () => {
    it('should call trailService.update(id, dto)', async () => {
      const dto = { name: 'Updated' };
      trailService.update.mockResolvedValue({ ...mockTrail, name: 'Updated' });

      const result = await controller.update('trail-1', dto as any);

      expect(trailService.update).toHaveBeenCalledWith('trail-1', dto);
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should call trailService.remove(id)', async () => {
      trailService.remove.mockResolvedValue(undefined);

      await controller.remove('trail-1');

      expect(trailService.remove).toHaveBeenCalledWith('trail-1');
    });
  });

  describe('getQRCode', () => {
    it('should generate a QR code data URL', async () => {
      trailService.findOne.mockResolvedValue(mockTrail);
      qrCodeService.generateQRCodeDataURL.mockResolvedValue('data:image/png;base64,abc');

      const result = await controller.getQRCode('trail-1');

      expect(result.qrCode).toBe('data:image/png;base64,abc');
      expect(result.trail).toEqual(mockTrail);
    });

    it('should pass custom width option', async () => {
      trailService.findOne.mockResolvedValue(mockTrail);
      qrCodeService.generateQRCodeDataURL.mockResolvedValue('data:image/png;base64,abc');

      await controller.getQRCode('trail-1', '500');

      expect(qrCodeService.generateQRCodeDataURL).toHaveBeenCalledWith(
        expect.any(String),
        { width: 500 },
      );
    });
  });

  describe('getQRCodeImage', () => {
    it('should generate a QR code PNG and send it', async () => {
      trailService.findOne.mockResolvedValue(mockTrail);
      const buffer = Buffer.from('png-data');
      qrCodeService.generateQRCodeBuffer.mockResolvedValue(buffer);
      const res = {
        set: jest.fn(),
        send: jest.fn(),
      } as any;

      await controller.getQRCodeImage('trail-1', undefined, res);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({ 'Content-Type': 'image/png' }),
      );
      expect(res.send).toHaveBeenCalledWith(buffer);
    });
  });
});
