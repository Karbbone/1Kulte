import { Injectable } from '@nestjs/common';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceRepository } from './cultural-place.repository';
import { CreateCulturalPlaceDto } from './dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from './dto/update-cultural-place.dto';

@Injectable()
export class CulturalPlaceService {
  constructor(
    private readonly culturalPlaceRepository: CulturalPlaceRepository,
  ) {}

  findAll(): Promise<CulturalPlace[]> {
    return this.culturalPlaceRepository.findAll();
  }

  findOne(id: string): Promise<CulturalPlace | null> {
    return this.culturalPlaceRepository.findOne(id);
  }

  async create(data: CreateCulturalPlaceDto): Promise<CulturalPlace> {
    const culturalPlace = this.culturalPlaceRepository.create(data);
    return this.culturalPlaceRepository.save(culturalPlace);
  }

  async update(
    id: string,
    data: UpdateCulturalPlaceDto,
  ): Promise<CulturalPlace | null> {
    await this.culturalPlaceRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.culturalPlaceRepository.delete(id);
  }
}
