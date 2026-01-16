import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Trail } from './trail.entity';

@Injectable()
export class TrailRepository {
  constructor(
    @InjectRepository(Trail)
    private readonly repository: Repository<Trail>,
  ) {}

  findAll(): Promise<Trail[]> {
    return this.repository.find({
      relations: ['culturalPlace'],
    });
  }

  findByCulturalPlaceId(culturalPlaceId: string): Promise<Trail[]> {
    return this.repository.find({
      where: { culturalPlace: { id: culturalPlaceId }, isActive: true },
      relations: ['questions', 'questions.answers'],
    });
  }

  findOne(id: string): Promise<Trail | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['culturalPlace', 'questions', 'questions.answers'],
    });
  }

  create(data: DeepPartial<Trail>): Trail {
    return this.repository.create(data);
  }

  save(trail: Trail): Promise<Trail> {
    return this.repository.save(trail);
  }

  update(id: string, data: Partial<Trail>): Promise<any> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}
