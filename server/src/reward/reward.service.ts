import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward } from './reward.entity';
import { RewardRepository } from './reward.repository';
import { UserReward } from './user-reward.entity';
import { UserRewardRepository } from './user-reward.repository';

@Injectable()
export class RewardService {
  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly userRewardRepository: UserRewardRepository,
    private readonly userRepository: UserRepository,
  ) {}

  findAll(): Promise<Reward[]> {
    return this.rewardRepository.findAll();
  }

  findOne(id: string): Promise<Reward | null> {
    return this.rewardRepository.findOne(id);
  }

  async create(rewardData: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(rewardData);
    return this.rewardRepository.save(reward);
  }

  async purchase(userId: string, rewardId: string): Promise<UserReward> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const reward = await this.rewardRepository.findOne(rewardId);
    if (!reward) {
      throw new NotFoundException('Récompense non trouvée');
    }

    if (user.points < reward.cost) {
      throw new BadRequestException(
        'Points insuffisants pour acheter cette récompense',
      );
    }

    user.points -= reward.cost;
    await this.userRepository.save(user);

    const userReward = this.userRewardRepository.create({
      userId,
      rewardId,
    });
    return this.userRewardRepository.save(userReward);
  }

  findUserRewards(userId: string): Promise<UserReward[]> {
    return this.userRewardRepository.findByUserId(userId);
  }
}
