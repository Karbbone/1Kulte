import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MinioService } from 'src/shares/minio/minio.service';
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
    private readonly minioService: MinioService,
  ) {}

  async findAll(): Promise<(Reward & { imageUrl: string | null })[]> {
    const rewards = await this.rewardRepository.findAll();
    return rewards.map((reward) => this.addImageUrl(reward));
  }

  async findOne(
    id: string,
  ): Promise<(Reward & { imageUrl: string | null }) | null> {
    const reward = await this.rewardRepository.findOne(id);
    if (!reward) return null;
    return this.addImageUrl(reward);
  }

  async create(rewardData: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(rewardData);
    return this.rewardRepository.save(reward);
  }

  async uploadImage(
    rewardId: string,
    file: Express.Multer.File,
  ): Promise<Reward & { imageUrl: string | null }> {
    const reward = await this.rewardRepository.findOne(rewardId);
    if (!reward) {
      throw new NotFoundException('Récompense non trouvée');
    }

    if (reward.image) {
      try {
        await this.minioService.deleteFile(reward.image);
      } catch {
        // Ignorer si le fichier n'existe plus
      }
    }

    const filePath = await this.minioService.uploadFile(
      file,
      `rewards/${rewardId}`,
    );
    reward.image = filePath;
    const savedReward = await this.rewardRepository.save(reward);
    return this.addImageUrl(savedReward);
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

  async findUserRewards(userId: string): Promise<UserReward[]> {
    const userRewards = await this.userRewardRepository.findByUserId(userId);
    return userRewards.map((ur) => ({
      ...ur,
      reward: this.addImageUrl(ur.reward),
    }));
  }

  private addImageUrl(
    reward: Reward,
  ): Reward & { imageUrl: string | null } {
    return {
      ...reward,
      imageUrl: reward.image
        ? this.minioService.getFileUrl(reward.image)
        : null,
    };
  }
}
