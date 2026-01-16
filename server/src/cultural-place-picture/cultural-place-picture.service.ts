import { Injectable, NotFoundException } from '@nestjs/common';
import { MinioService } from '../shares/minio/minio.service';
import { CulturalPlacePicture } from './cultural-place-picture.entity';
import { CulturalPlacePictureRepository } from './cultural-place-picture.repository';

export interface CulturalPlacePictureWithUrl extends CulturalPlacePicture {
  url: string;
}

@Injectable()
export class CulturalPlacePictureService {
  constructor(
    private readonly pictureRepository: CulturalPlacePictureRepository,
    private readonly minioService: MinioService,
  ) {}

  private addUrl(picture: CulturalPlacePicture): CulturalPlacePictureWithUrl {
    return {
      ...picture,
      url: this.minioService.getFileUrl(picture.path),
    };
  }

  async findByCulturalPlaceId(culturalPlaceId: string): Promise<CulturalPlacePictureWithUrl[]> {
    const pictures = await this.pictureRepository.findByCulturalPlaceId(culturalPlaceId);
    return pictures.map((p) => this.addUrl(p));
  }

  async upload(
    culturalPlaceId: string,
    file: Express.Multer.File,
    mainPicture: boolean = false,
  ): Promise<CulturalPlacePictureWithUrl> {
    const folder = `cultural-places/${culturalPlaceId}`;
    const path = await this.minioService.uploadFile(file, folder);

    if (mainPicture) {
      await this.pictureRepository.removeMainPicture(culturalPlaceId);
    }

    const picture = this.pictureRepository.create({
      name: file.originalname,
      path,
      mainPicture,
      culturalPlace: { id: culturalPlaceId },
    });

    const savedPicture = await this.pictureRepository.save(picture);
    return this.addUrl(savedPicture);
  }

  async setMainPicture(id: string): Promise<CulturalPlacePictureWithUrl> {
    const picture = await this.pictureRepository.findOne(id);
    if (!picture) {
      throw new NotFoundException('Image non trouvée');
    }

    await this.pictureRepository.removeMainPicture(picture.culturalPlace.id);
    await this.pictureRepository.update(id, { mainPicture: true });

    return this.addUrl({ ...picture, mainPicture: true });
  }

  async delete(id: string): Promise<void> {
    const picture = await this.pictureRepository.findOne(id);
    if (!picture) {
      throw new NotFoundException('Image non trouvée');
    }

    await this.minioService.deleteFile(picture.path);
    await this.pictureRepository.delete(id);
  }

  getFileUrl(path: string): string {
    return this.minioService.getFileUrl(path);
  }
}
