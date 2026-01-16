import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CulturalPlacePicture } from './cultural-place-picture.entity';

@Injectable()
export class CulturalPlacePictureRepository {
  constructor(
    @InjectRepository(CulturalPlacePicture)
    private readonly repository: Repository<CulturalPlacePicture>,
  ) {}

  findByCulturalPlaceId(culturalPlaceId: string): Promise<CulturalPlacePicture[]> {
    return this.repository.find({
      where: { culturalPlace: { id: culturalPlaceId } },
    });
  }

  findOne(id: string): Promise<CulturalPlacePicture | null> {
    return this.repository.findOneBy({ id });
  }

  findMainPicture(culturalPlaceId: string): Promise<CulturalPlacePicture | null> {
    return this.repository.findOne({
      where: {
        culturalPlace: { id: culturalPlaceId },
        mainPicture: true,
      },
    });
  }

  create(data: DeepPartial<CulturalPlacePicture>): CulturalPlacePicture {
    return this.repository.create(data);
  }

  save(picture: CulturalPlacePicture): Promise<CulturalPlacePicture> {
    return this.repository.save(picture);
  }

  update(id: string, data: Partial<CulturalPlacePicture>): Promise<any> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }

  async removeMainPicture(culturalPlaceId: string): Promise<void> {
    await this.repository.update(
      { culturalPlace: { id: culturalPlaceId }, mainPicture: true },
      { mainPicture: false },
    );
  }
}
