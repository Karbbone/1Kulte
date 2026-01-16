import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoriteRepository {
  constructor(
    @InjectRepository(Favorite)
    private readonly repository: Repository<Favorite>,
  ) {}

  findByUserId(userId: string): Promise<Favorite[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['culturalPlace'],
    });
  }

  findOne(userId: string, culturalPlaceId: string): Promise<Favorite | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        culturalPlace: { id: culturalPlaceId },
      },
    });
  }

  create(userId: string, culturalPlaceId: string): Favorite {
    return this.repository.create({
      user: { id: userId },
      culturalPlace: { id: culturalPlaceId },
    });
  }

  save(favorite: Favorite): Promise<Favorite> {
    return this.repository.save(favorite);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}
