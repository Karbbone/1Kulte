import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalPlace } from './cultural-place.entity';

@Injectable()
export class CulturalPlaceRepository {
  constructor(
    @InjectRepository(CulturalPlace)
    private readonly repository: Repository<CulturalPlace>,
  ) {}

  findAll(): Promise<CulturalPlace[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<CulturalPlace | null> {
    return this.repository.findOneBy({ id });
  }

  create(data: Partial<CulturalPlace>): CulturalPlace {
    return this.repository.create(data);
  }

  save(culturalPlace: CulturalPlace): Promise<CulturalPlace> {
    return this.repository.save(culturalPlace);
  }

  update(id: string, data: Partial<CulturalPlace>): Promise<any> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}
