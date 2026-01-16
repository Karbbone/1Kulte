import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReward } from './user-reward.entity';

@Injectable()
export class UserRewardRepository {
  constructor(
    @InjectRepository(UserReward)
    private readonly repository: Repository<UserReward>,
  ) {}

  findByUserId(userId: string): Promise<UserReward[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['reward'],
    });
  }

  create(data: { userId: string; rewardId: string }): UserReward {
    return this.repository.create({
      user: { id: data.userId },
      reward: { id: data.rewardId },
    });
  }

  save(userReward: UserReward): Promise<UserReward> {
    return this.repository.save(userReward);
  }
}
