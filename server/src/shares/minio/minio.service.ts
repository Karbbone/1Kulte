import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey:
        this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey:
        this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
    });
    this.bucketName =
      this.configService.get<string>('MINIO_BUCKET_NAME') || '1kulte';
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName);
      await this.minioClient.setBucketPolicy(
        this.bucketName,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        }),
      );
    }
  }

  private sanitizeFileName(fileName: string): string {
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    const name = fileName.substring(0, fileName.lastIndexOf('.'));

    const sanitized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-') // Remplace tout sauf lettres/chiffres par des tirets
      .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
      .replace(/^-|-$/g, ''); // Supprime les tirets au début/fin

    return `${sanitized}${extension.toLowerCase()}`;
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const sanitizedName = this.sanitizeFileName(file.originalname);
    const fileName = `${folder}/${Date.now()}-${sanitizedName}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return fileName;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  getFileUrl(fileName: string): string {
    const publicUrl = this.configService.get<string>('MINIO_PUBLIC_URL');

    if (publicUrl) {
      return `${publicUrl}/${this.bucketName}/${fileName}`;
    }

    const endpoint =
      this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get<string>('MINIO_PORT') || '9000';
    const useSSL = this.configService.get<string>('MINIO_USE_SSL') === 'true';
    const protocol = useSSL ? 'https' : 'http';

    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
  }
}
