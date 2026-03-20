import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from '../user/auth.guard';
import { User } from '../user/user.entity';
import { AddRewardCartItemDto } from './dto/add-reward-cart-item.dto';
import { CreateRewardDto } from './dto/create-reward.dto';
import { GetNearbyRelayPointsDto } from './dto/get-nearby-relay-points.dto';
import { UpdateRewardCartDeliveryDto } from './dto/update-reward-cart-delivery.dto';
import { UpdateRewardCartItemDto } from './dto/update-reward-cart-item.dto';
import { UpdateRewardCartWalletDiscountDto } from './dto/update-reward-cart-wallet-discount.dto';
import { Reward } from './reward.entity';
import { RewardCartResponse, RewardService } from './reward.service';
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

  @UseGuards(AuthGuard)
  @Get('cart')
  getCart(@Req() req: AuthenticatedRequest): Promise<RewardCartResponse> {
    const userId = req.user.user.id;
    return this.rewardService.getCart(userId);
  }

  @UseGuards(AuthGuard)
  @Get('relay-points/nearby')
  getNearbyRelayPoints(@Query() query: GetNearbyRelayPointsDto) {
    return this.rewardService.getNearbyRelayPoints(
      query.latitude,
      query.longitude,
    );
  }

  @UseGuards(AuthGuard)
  @Post('cart/items')
  addToCart(
    @Req() req: AuthenticatedRequest,
    @Body() body: AddRewardCartItemDto,
  ): Promise<RewardCartResponse> {
    const userId = req.user.user.id;
    return this.rewardService.addToCart(userId, body);
  }

  @UseGuards(AuthGuard)
  @Patch('cart/items/:itemId')
  updateCartItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
    @Body() body: UpdateRewardCartItemDto,
  ): Promise<RewardCartResponse> {
    const userId = req.user.user.id;
    return this.rewardService.updateCartItemQuantity(userId, itemId, body);
  }

  @UseGuards(AuthGuard)
  @Delete('cart/items/:itemId')
  removeCartItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ): Promise<RewardCartResponse> {
    const userId = req.user.user.id;
    return this.rewardService.removeCartItem(userId, itemId);
  }

  @UseGuards(AuthGuard)
  @Patch('cart/delivery')
  updateCartDelivery(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateRewardCartDeliveryDto,
  ): Promise<RewardCartResponse> {
    const userId = req.user.user.id;
    return this.rewardService.updateCartDelivery(userId, body);
  }

  @UseGuards(AuthGuard)
  @Patch('cart/wallet-discount')
  updateCartWalletDiscount(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateRewardCartWalletDiscountDto,
  ): Promise<RewardCartResponse> {
    const userId = req.user.user.id;
    return this.rewardService.updateCartWalletDiscount(userId, body);
  }

  @UseGuards(AuthGuard)
  @Post('cart/checkout')
  checkoutCart(@Req() req: AuthenticatedRequest): Promise<{ purchasedCount: number; total: number }> {
    const userId = req.user.user.id;
    return this.rewardService.checkoutCart(userId);
  }

  @Get(':id')
  async findOne(@Param('id') rewardId: string) {
    const reward = await this.rewardService.findOne(rewardId);
    if (!reward) {
      throw new NotFoundException('Récompense non trouvée');
    }
    return reward;
  }
}
