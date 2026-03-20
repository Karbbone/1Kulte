import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RewardCartItem } from './reward-cart-item.entity';
import { UserReward } from './user-reward.entity';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number(value),
    },
  })
  cost: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @OneToMany(() => UserReward, (userReward) => userReward.reward)
  userRewards?: UserReward[];

  @OneToMany(() => RewardCartItem, (cartItem) => cartItem.reward)
  cartItems?: RewardCartItem[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
