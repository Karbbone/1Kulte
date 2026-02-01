import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../user/auth.guard';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';
import { Trail } from './trail.entity';
import { TrailService } from './trail.service';
import { QRCodeService } from './qrcode.service';

@Controller('trails')
export class TrailController {
  constructor(
    private readonly trailService: TrailService,
    private readonly qrCodeService: QRCodeService,
  ) {}

  @Get()
  findAll(): Promise<Trail[]> {
    return this.trailService.findAll();
  }

  @Get('cultural-place/:culturalPlaceId')
  findByCulturalPlace(
    @Param('culturalPlaceId') culturalPlaceId: string,
  ): Promise<Trail[]> {
    return this.trailService.findByCulturalPlaceId(culturalPlaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Trail> {
    return this.trailService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTrailDto: CreateTrailDto): Promise<Trail> {
    return this.trailService.create(createTrailDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrailDto: UpdateTrailDto,
  ): Promise<Trail> {
    return this.trailService.update(id, updateTrailDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.trailService.remove(id);
  }

  /**
   * Génère un QR code pour un trail (retourne un data URL base64)
   * Le QR code contient les données JSON du trail + lieu culturel
   * GET /trails/:id/qrcode?width=300
   */
  @Get(':id/qrcode')
  async getQRCode(
    @Param('id') id: string,
    @Query('width') width?: string,
  ): Promise<{ qrCode: string; trail: Trail }> {
    // Récupère le trail avec le lieu culturel
    const trail = await this.trailService.findOne(id);

    // Prépare les données pour le QR code (sans les questions pour alléger)
    const qrData = {
      trail: {
        id: trail.id,
        name: trail.name,
        description: trail.description,
        durationMinute: trail.durationMinute,
        difficulty: trail.difficulty,
      },
      culturalPlace: trail.culturalPlace,
    };

    const qrCodeOptions = width ? { width: Number.parseInt(width, 10) } : undefined;
    const qrCode = await this.qrCodeService.generateQRCodeDataURL(
      JSON.stringify(qrData),
      qrCodeOptions,
    );

    return {
      qrCode,
      trail,
    };
  }

  /**
   * Génère un QR code pour un trail (retourne une image PNG)
   * Le QR code contient les données JSON du trail + lieu culturel
   * GET /trails/:id/qrcode/image?width=300
   */
  @Get(':id/qrcode/image')
  async getQRCodeImage(
    @Param('id') id: string,
    @Query('width') width: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    // Récupère le trail avec le lieu culturel
    const trail = await this.trailService.findOne(id);

    // Prépare les données pour le QR code (sans les questions pour alléger)
    const qrData = {
      trail: {
        id: trail.id,
        name: trail.name,
        description: trail.description,
        durationMinute: trail.durationMinute,
        difficulty: trail.difficulty,
      },
      culturalPlace: trail.culturalPlace,
    };

    const qrCodeOptions = width ? { width: Number.parseInt(width, 10) } : undefined;
    const buffer = await this.qrCodeService.generateQRCodeBuffer(
      JSON.stringify(qrData),
      qrCodeOptions,
    );

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(buffer);
  }
}
