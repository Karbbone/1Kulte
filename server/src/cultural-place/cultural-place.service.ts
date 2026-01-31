import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../favorite/favorite.entity';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceType } from './cultural-place-type.enum';
import { CulturalPlaceRepository } from './cultural-place.repository';
import { CreateCulturalPlaceDto } from './dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from './dto/update-cultural-place.dto';

@Injectable()
export class CulturalPlaceService {
  constructor(
    private readonly culturalPlaceRepository: CulturalPlaceRepository,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
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

  /**
   * Retourne les 5 lieux les plus populaires basés sur le nombre de favoris
   */
  async findPopular(
    limit: number = 5,
  ): Promise<(CulturalPlace & { favoriteCount: number })[]> {
    return this.culturalPlaceRepository.findPopular(limit);
  }

  /**
   * Retourne 5 recommandations personnalisées pour un utilisateur
   * Algorithme :
   * 1. Récupère les favoris de l'utilisateur
   * 2. Identifie les types de lieux préférés
   * 3. Recommande des lieux similaires (même type) non encore likés
   * 4. Si pas assez de recommandations, complète avec des lieux aléatoires
   */
  async findRecommendations(
    userId: string,
    limit: number = 5,
  ): Promise<CulturalPlace[]> {
    // Récupérer les favoris de l'utilisateur
    const userFavorites = await this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['culturalPlace'],
    });

    const favoritePlaceIds = userFavorites.map((f) => f.culturalPlace.id);

    // Si l'utilisateur n'a pas de favoris, retourner des lieux aléatoires
    if (userFavorites.length === 0) {
      return this.culturalPlaceRepository.findRandom(limit);
    }

    // Identifier les types préférés (comptage)
    const typeCount = new Map<CulturalPlaceType, number>();
    for (const favorite of userFavorites) {
      const type = favorite.culturalPlace.type;
      typeCount.set(type, (typeCount.get(type) || 0) + 1);
    }

    // Trier les types par fréquence (du plus aimé au moins aimé)
    const sortedTypes = [...typeCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);

    // Chercher des lieux des types préférés, en excluant ceux déjà likés
    const recommendations =
      await this.culturalPlaceRepository.findByTypesExcludingIds(
        sortedTypes,
        favoritePlaceIds,
        limit,
      );

    // Si pas assez de recommandations, compléter avec des lieux aléatoires
    if (recommendations.length < limit) {
      const allExcludedIds = [
        ...favoritePlaceIds,
        ...recommendations.map((r) => r.id),
      ];
      const additionalPlaces =
        await this.culturalPlaceRepository.findByTypesExcludingIds(
          [],
          allExcludedIds,
          limit - recommendations.length,
        );
      recommendations.push(...additionalPlaces);
    }

    return recommendations;
  }
}
