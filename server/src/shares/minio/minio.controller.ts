import { Controller, Get, Req, Res, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import { MinioService } from './minio.service';

@Controller('files')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Get('*')
  async proxyFile(@Req() req: Request, @Res() res: Response) {
    // Extract path after /files/ — includes bucket name prefix (e.g. "1kulte/qcm/...")
    const fullPath = req.params[0];

    if (!fullPath) {
      throw new NotFoundException('File path is required');
    }

    // Strip the bucket name (first segment) to get the actual MinIO object key
    const slashIndex = fullPath.indexOf('/');
    if (slashIndex === -1) {
      throw new NotFoundException('Invalid file path');
    }
    const filePath = fullPath.substring(slashIndex + 1);

    try {
      const stat = await this.minioService.getObjectStat(filePath);
      const stream = await this.minioService.getObjectStream(filePath);

      res.set({
        'Content-Type': stat.metaData?.['content-type'] || 'application/octet-stream',
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=86400',
      });

      (stream as any).pipe(res);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}
