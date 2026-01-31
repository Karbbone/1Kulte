import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceType } from './cultural-place-type.enum';

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

  /**
   * Trouve les lieux populaires basés sur le nombre de favoris
   */
  async findPopular(limit: number = 5): Promise<(CulturalPlace & { favoriteCount: number })[]> {
    const results = await this.repository
      .createQueryBuilder('cp')
      .leftJoin('favorites', 'f', 'f.cultural_place_id = cp.id')
      .select('cp.*')
      .addSelect('COUNT(f.id)', 'favoriteCount')
      .groupBy('cp.id')
      .orderBy('favoriteCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      postCode: row.postCode,
      city: row.city,
      latitude: row.latitude,
      longitude: row.longitude,
      type: row.type,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      favoriteCount: Number.parseInt(row.favoriteCount, 10),
    }));
  }

  /**
   * Trouve des lieux par types, en excluant certains IDs
   */
  findByTypesExcludingIds(
    types: CulturalPlaceType[],
    excludeIds: string[],
    limit: number = 5,
  ): Promise<CulturalPlace[]> {
    const whereCondition: any = {};

    if (types.length > 0) {
      whereCondition.type = In(types);
    }

    if (excludeIds.length > 0) {
      whereCondition.id = Not(In(excludeIds));
    }

    return this.repository.find({
      where: Object.keys(whereCondition).length > 0 ? whereCondition : undefined,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Trouve des lieux aléatoires
   */
  async findRandom(limit: number = 5): Promise<CulturalPlace[]> {
    return this.repository
      .createQueryBuilder('cp')
      .orderBy('RAND()')
      .limit(limit)
      .getMany();
  }
}
