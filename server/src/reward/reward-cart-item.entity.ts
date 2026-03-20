import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reward } from './reward.entity';
import { RewardCart } from './reward-cart.entity';

@Entity('reward_cart_items')
export class RewardCartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RewardCart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: RewardCart;

  @ManyToOne(() => Reward, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
