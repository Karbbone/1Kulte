import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';
import { Trail } from './trail.entity';
import { TrailRepository } from './trail.repository';

@Injectable()
export class TrailService {
  constructor(private readonly trailRepository: TrailRepository) {}

  findAll(): Promise<Trail[]> {
    return this.trailRepository.findAll();
  }

  findByCulturalPlaceId(culturalPlaceId: string): Promise<Trail[]> {
    return this.trailRepository.findByCulturalPlaceId(culturalPlaceId);
  }

  async findOne(id: string): Promise<Trail> {
    const trail = await this.trailRepository.findOne(id);
    if (!trail) {
      throw new NotFoundException('Trail non trouvé');
    }
    return trail;
  }

  async create(data: CreateTrailDto): Promise<Trail> {
    const trail = this.trailRepository.create({
      ...data,
      culturalPlace: { id: data.culturalPlaceId },
    });
    return this.trailRepository.save(trail);
  }

  async update(id: string, data: UpdateTrailDto): Promise<Trail> {
    const trail = await this.findOne(id);
    await this.trailRepository.update(id, data);
    return { ...trail, ...data };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.trailRepository.delete(id);
  }
}
