import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../user/user.module';
import { RewardCartItem } from './reward-cart-item.entity';
import { RewardCartItemRepository } from './reward-cart-item.repository';
import { RewardCart } from './reward-cart.entity';
import { RewardCartRepository } from './reward-cart.repository';
import { RewardController } from './reward.controller';
import { Reward } from './reward.entity';
import { RewardRepository } from './reward.repository';
import { RewardService } from './reward.service';
import { UserReward } from './user-reward.entity';
import { UserRewardRepository } from './user-reward.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, UserReward, RewardCart, RewardCartItem]),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    RewardService,
    RewardRepository,
    UserRewardRepository,
    RewardCartRepository,
    RewardCartItemRepository,
  ],
  controllers: [RewardController],
  exports: [RewardService],
})
export class RewardModule {}
