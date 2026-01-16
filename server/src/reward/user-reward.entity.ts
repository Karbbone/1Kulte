import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Reward } from './reward.entity';

@Entity('user_rewards')
export class UserReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Reward, (reward) => reward.userRewards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
