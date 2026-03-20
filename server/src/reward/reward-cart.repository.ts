import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardCart } from './reward-cart.entity';

@Injectable()
export class RewardCartRepository {
  constructor(
    @InjectRepository(RewardCart)
    private readonly repository: Repository<RewardCart>,
  ) {}

  findByUserIdWithItems(userId: string): Promise<RewardCart | null> {
    return this.repository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.reward'],
      order: { items: { createdAt: 'DESC' } },
    });
  }

  createForUser(userId: string): RewardCart {
    return this.repository.create({
      user: { id: userId },
    });
  }

  save(cart: RewardCart): Promise<RewardCart> {
    return this.repository.save(cart);
  }
}
