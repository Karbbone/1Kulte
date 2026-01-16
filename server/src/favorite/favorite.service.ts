import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Favorite } from './favorite.entity';
import { FavoriteRepository } from './favorite.repository';

@Injectable()
export class FavoriteService {
  constructor(private readonly favoriteRepository: FavoriteRepository) {}

  findUserFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.findByUserId(userId);
  }

  async addFavorite(userId: string, culturalPlaceId: string): Promise<Favorite> {
    const existing = await this.favoriteRepository.findOne(userId, culturalPlaceId);
    if (existing) {
      throw new ConflictException('Ce lieu est déjà dans vos favoris');
    }

    const favorite = this.favoriteRepository.create(userId, culturalPlaceId);
    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(userId: string, culturalPlaceId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne(userId, culturalPlaceId);
    if (!favorite) {
      throw new NotFoundException('Ce favori n\'existe pas');
    }

    await this.favoriteRepository.delete(favorite.id);
  }
}
