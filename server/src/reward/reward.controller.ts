import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from '../user/auth.guard';
import { User } from '../user/user.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward } from './reward.entity';
import { RewardService } from './reward.service';
import { UserReward } from './user-reward.entity';

interface AuthenticatedRequest extends Request {
  user: { user: User };
}

@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  findAll() {
    return this.rewardService.findAll();
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return this.rewardService.create(createRewardDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id') rewardId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.rewardService.uploadImage(rewardId, file);
  }

  @UseGuards(AuthGuard)
  @Post(':id/purchase')
  purchase(
    @Param('id') rewardId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<UserReward> {
    const userId = req.user.user.id;
    return this.rewardService.purchase(userId, rewardId);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  findMyRewards(@Req() req: AuthenticatedRequest): Promise<UserReward[]> {
    const userId = req.user.user.id;
    return this.rewardService.findUserRewards(userId);
  }
}
