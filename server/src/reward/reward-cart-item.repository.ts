import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RewardCartItem } from './reward-cart-item.entity';

@Injectable()
export class RewardCartItemRepository {
  constructor(
    @InjectRepository(RewardCartItem)
    private readonly repository: Repository<RewardCartItem>,
  ) {}

  findByCartAndReward(
    cartId: string,
    rewardId: string,
  ): Promise<RewardCartItem | null> {
    return this.repository.findOne({
      where: {
        cart: { id: cartId },
        reward: { id: rewardId },
      },
      relations: ['reward', 'cart'],
    });
  }

  findByIdForUser(itemId: string, userId: string): Promise<RewardCartItem | null> {
    return this.repository.findOne({
      where: {
        id: itemId,
        cart: {
          user: { id: userId },
        },
      },
      relations: ['reward', 'cart', 'cart.user'],
    });
  }

  create(data: { cartId: string; rewardId: string; quantity: number }): RewardCartItem {
    return this.repository.create({
      cart: { id: data.cartId },
      reward: { id: data.rewardId },
      quantity: data.quantity,
    });
  }

  save(item: RewardCartItem): Promise<RewardCartItem> {
    return this.repository.save(item);
  }

  remove(item: RewardCartItem): Promise<RewardCartItem> {
    return this.repository.remove(item);
  }

  async deleteByCartId(cartId: string): Promise<void> {
    await this.repository.delete({ cart: { id: cartId } });
  }
}
