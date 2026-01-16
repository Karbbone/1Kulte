import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';

@Injectable()
export class RewardRepository {
  constructor(
    @InjectRepository(Reward)
    private readonly repository: Repository<Reward>,
  ) {}

  findAll(): Promise<Reward[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<Reward | null> {
    return this.repository.findOneBy({ id });
  }

  create(rewardData: Partial<Reward>): Reward {
    return this.repository.create(rewardData);
  }

  save(reward: Reward): Promise<Reward> {
    return this.repository.save(reward);
  }
}
