import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MinioService } from '../shares/minio/minio.service';
import { UserRepository } from '../user/user.repository';
import { AddRewardCartItemDto } from './dto/add-reward-cart-item.dto';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardCartDeliveryDto } from './dto/update-reward-cart-delivery.dto';
import { UpdateRewardCartItemDto } from './dto/update-reward-cart-item.dto';
import { UpdateRewardCartWalletDiscountDto } from './dto/update-reward-cart-wallet-discount.dto';
import { RewardCartItemRepository } from './reward-cart-item.repository';
import { RewardCartRepository } from './reward-cart.repository';
import { RewardDeliveryMode } from './reward-delivery-mode.enum';
import { Reward } from './reward.entity';
import { RewardRelayOption } from './reward-relay-option.enum';
import { RewardRepository } from './reward.repository';
import { UserReward } from './user-reward.entity';
import { UserRewardRepository } from './user-reward.repository';

export interface RewardWithImageUrl extends Reward {
  imageUrl: string | null;
}

export interface RewardCartItemResponse {
  id: string;
  quantity: number;
  lineTotal: number;
  reward: RewardWithImageUrl;
}

export interface RewardCartResponse {
  id: string;
  deliveryMode: RewardDeliveryMode;
  relayOption: RewardRelayOption;
  homeRecipient: string | null;
  homeAddressLine1: string | null;
  homeAddressLine2: string | null;
  homePostalCode: string | null;
  homeCity: string | null;
  relayPointName: string | null;
  relayAddress: string | null;
  useWalletDiscount: boolean;
  items: RewardCartItemResponse[];
  subtotal: number;
  deliveryFee: number;
  availablePoints: number;
  usedPoints: number;
  walletDiscount: number;
  total: number;
}

export interface RelayPointResponse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
}

interface RelayPointSeed {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class RewardService {
  private static readonly PRIORITY_RELAY_FEE = 6;
  private static readonly POINTS_PER_EURO = 40;
  private static readonly MAX_DISCOUNT_RATE = 0.3;
  private static readonly RELAY_POINTS: RelayPointSeed[] = [
    {
      id: 'relay-vannes-centre',
      name: 'Mondial Relay Vannes Centre',
      address: '14 Rue Thiers, 56000 Vannes',
      latitude: 47.6582,
      longitude: -2.7617,
    },
    {
      id: 'relay-vannes-gare',
      name: 'Relais Gare de Vannes',
      address: '3 Place de la Gare, 56000 Vannes',
      latitude: 47.6644,
      longitude: -2.7522,
    },
    {
      id: 'relay-plescop-bourg',
      name: 'Point Relais Plescop Bourg',
      address: '7 Place Marianne, 56890 Plescop',
      latitude: 47.6999,
      longitude: -2.8013,
    },
    {
      id: 'relay-arradon',
      name: 'Relais Arradon Port',
      address: '9 Rue de l Église, 56610 Arradon',
      latitude: 47.6235,
      longitude: -2.8215,
    },
    {
      id: 'relay-auray-centre',
      name: 'Point Relais Auray Centre',
      address: '28 Rue du Belzic, 56400 Auray',
      latitude: 47.6676,
      longitude: -2.9872,
    },
  ];

  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly userRewardRepository: UserRewardRepository,
    private readonly userRepository: UserRepository,
    private readonly rewardCartRepository: RewardCartRepository,
    private readonly rewardCartItemRepository: RewardCartItemRepository,
    private readonly minioService: MinioService,
  ) {}

  async findAll(): Promise<RewardWithImageUrl[]> {
    const rewards = await this.rewardRepository.findAll();
    return rewards.map((reward) => this.addImageUrl(reward));
  }

  async findOne(id: string): Promise<RewardWithImageUrl | null> {
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
  ): Promise<RewardWithImageUrl> {
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

  async getCart(userId: string): Promise<RewardCartResponse> {
    const cart = await this.getOrCreateCart(userId);
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return this.toCartResponse(cart, user.points ?? 0);
  }

  async addToCart(
    userId: string,
    addItemDto: AddRewardCartItemDto,
  ): Promise<RewardCartResponse> {
    const quantity = addItemDto.quantity ?? 1;

    const reward = await this.rewardRepository.findOne(addItemDto.rewardId);
    if (!reward) {
      throw new NotFoundException('Récompense non trouvée');
    }

    const cart = await this.getOrCreateCart(userId);
    const existingItem = await this.rewardCartItemRepository.findByCartAndReward(
      cart.id,
      addItemDto.rewardId,
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > 20) {
        throw new BadRequestException(
          'Quantité maximum par article: 20',
        );
      }
      existingItem.quantity += quantity;
      await this.rewardCartItemRepository.save(existingItem);
    } else {
      const newItem = this.rewardCartItemRepository.create({
        cartId: cart.id,
        rewardId: addItemDto.rewardId,
        quantity,
      });
      await this.rewardCartItemRepository.save(newItem);
    }

    return this.getCart(userId);
  }

  async updateCartItemQuantity(
    userId: string,
    itemId: string,
    dto: UpdateRewardCartItemDto,
  ): Promise<RewardCartResponse> {
    const item = await this.rewardCartItemRepository.findByIdForUser(itemId, userId);
    if (!item) {
      throw new NotFoundException('Article du panier non trouvé');
    }

    item.quantity = dto.quantity;
    await this.rewardCartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string): Promise<RewardCartResponse> {
    const item = await this.rewardCartItemRepository.findByIdForUser(itemId, userId);
    if (!item) {
      throw new NotFoundException('Article du panier non trouvé');
    }

    await this.rewardCartItemRepository.remove(item);
    return this.getCart(userId);
  }

  async updateCartDelivery(
    userId: string,
    dto: UpdateRewardCartDeliveryDto,
  ): Promise<RewardCartResponse> {
    const cart = await this.getOrCreateCart(userId);

    cart.deliveryMode = dto.deliveryMode;

    if (dto.homeRecipient !== undefined) cart.homeRecipient = dto.homeRecipient;
    if (dto.homeAddressLine1 !== undefined) {
      cart.homeAddressLine1 = dto.homeAddressLine1;
    }
    if (dto.homeAddressLine2 !== undefined) {
      cart.homeAddressLine2 = dto.homeAddressLine2;
    }
    if (dto.homePostalCode !== undefined) cart.homePostalCode = dto.homePostalCode;
    if (dto.homeCity !== undefined) cart.homeCity = dto.homeCity;

    if (dto.relayPointName !== undefined) cart.relayPointName = dto.relayPointName;
    if (dto.relayAddress !== undefined) cart.relayAddress = dto.relayAddress;
    if (dto.relayOption !== undefined) cart.relayOption = dto.relayOption;

    if (cart.deliveryMode === RewardDeliveryMode.HOME) {
      if (!cart.homeAddressLine1 || !cart.homePostalCode || !cart.homeCity) {
        throw new BadRequestException(
          'Adresse de livraison incomplète pour le mode domicile',
        );
      }
    }

    if (cart.deliveryMode === RewardDeliveryMode.RELAY) {
      if (!cart.relayPointName || !cart.relayAddress) {
        throw new BadRequestException(
          'Point relais incomplet pour le mode point relais',
        );
      }

      if (!cart.relayOption) {
        cart.relayOption = RewardRelayOption.STANDARD;
      }
    }

    await this.rewardCartRepository.save(cart);
    return this.getCart(userId);
  }

  async updateCartWalletDiscount(
    userId: string,
    dto: UpdateRewardCartWalletDiscountDto,
  ): Promise<RewardCartResponse> {
    const cart = await this.getOrCreateCart(userId);
    cart.useWalletDiscount = dto.useWalletDiscount;
    await this.rewardCartRepository.save(cart);
    return this.getCart(userId);
  }

  getNearbyRelayPoints(
    latitude: number,
    longitude: number,
  ): RelayPointResponse[] {
    return RewardService.RELAY_POINTS
      .map((relayPoint) => {
        const distanceKm = this.calculateDistanceKm(
          latitude,
          longitude,
          relayPoint.latitude,
          relayPoint.longitude,
        );
        return {
          ...relayPoint,
          distanceKm: Number(distanceKm.toFixed(1)),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }

  async checkoutCart(userId: string): Promise<{ purchasedCount: number; total: number }> {
    const cart = await this.getOrCreateCart(userId);
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Le panier est vide');
    }

    if (cart.deliveryMode === RewardDeliveryMode.HOME) {
      if (!cart.homeAddressLine1 || !cart.homePostalCode || !cart.homeCity) {
        throw new BadRequestException(
          'Adresse de livraison obligatoire pour finaliser la commande',
        );
      }
    }

    if (cart.deliveryMode === RewardDeliveryMode.RELAY) {
      if (!cart.relayPointName || !cart.relayAddress) {
        throw new BadRequestException(
          'Point relais obligatoire pour finaliser la commande',
        );
      }
    }

    const purchasedRewards: UserReward[] = [];
    for (const item of cart.items) {
      for (let i = 0; i < item.quantity; i += 1) {
        purchasedRewards.push(
          this.userRewardRepository.create({
            userId,
            rewardId: item.reward.id,
          }),
        );
      }
    }

    await this.userRewardRepository.saveMany(purchasedRewards);
    await this.rewardCartItemRepository.deleteByCartId(cart.id);

    const cartSummary = this.toCartResponse(cart, user.points ?? 0);

    if (cartSummary.usedPoints > 0) {
      user.points = Math.max((user.points ?? 0) - cartSummary.usedPoints, 0);
      await this.userRepository.save(user);
    }

    return {
      purchasedCount: purchasedRewards.length,
      total: cartSummary.total,
    };
  }

  private async getOrCreateCart(userId: string) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    let cart = await this.rewardCartRepository.findByUserIdWithItems(userId);

    if (!cart) {
      const newCart = this.rewardCartRepository.createForUser(userId);
      newCart.deliveryMode = RewardDeliveryMode.HOME;
      newCart.relayOption = RewardRelayOption.STANDARD;
      newCart.homeRecipient = null;
      newCart.homeAddressLine1 = null;
      newCart.homeAddressLine2 = null;
      newCart.homePostalCode = null;
      newCart.homeCity = null;
      newCart.relayPointName = null;
      newCart.relayAddress = null;
      newCart.useWalletDiscount = true;
      await this.rewardCartRepository.save(newCart);
      cart = await this.rewardCartRepository.findByUserIdWithItems(userId);
    }

    if (!cart) {
      throw new NotFoundException('Panier introuvable');
    }

    return cart;
  }

  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const earthRadiusKm = 6371;
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  private degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private toCartResponse(cart: {
    id: string;
    deliveryMode: RewardDeliveryMode;
    relayOption: RewardRelayOption;
    homeRecipient: string | null;
    homeAddressLine1: string | null;
    homeAddressLine2: string | null;
    homePostalCode: string | null;
    homeCity: string | null;
    relayPointName: string | null;
    relayAddress: string | null;
    useWalletDiscount: boolean;
    items: Array<{ id: string; quantity: number; reward: Reward }>;
  }, userPoints: number): RewardCartResponse {
    const items: RewardCartItemResponse[] = (cart.items || []).map((item) => {
      const rewardWithImage = this.addImageUrl(item.reward);
      const lineTotal = this.roundCurrency(item.quantity * rewardWithImage.cost);

      return {
        id: item.id,
        quantity: item.quantity,
        lineTotal,
        reward: rewardWithImage,
      };
    });

    const subtotal = this.roundCurrency(
      items.reduce((acc, item) => acc + item.lineTotal, 0),
    );
    const deliveryFee = this.getDeliveryFee(cart.deliveryMode, cart.relayOption);
    let usedPoints = 0;
    let walletDiscount = 0;

    if (cart.useWalletDiscount) {
      const maxDiscountByPoints = this.roundCurrency(
        userPoints / RewardService.POINTS_PER_EURO,
      );
      const maxDiscountByPolicy = this.roundCurrency(
        subtotal * RewardService.MAX_DISCOUNT_RATE,
      );
      const tentativeDiscount = Math.min(maxDiscountByPoints, maxDiscountByPolicy);
      usedPoints = Math.min(
        Math.floor(tentativeDiscount * RewardService.POINTS_PER_EURO),
        userPoints,
      );
      walletDiscount = this.roundCurrency(
        usedPoints / RewardService.POINTS_PER_EURO,
      );
    }
    const total = this.roundCurrency(subtotal + deliveryFee - walletDiscount);

    return {
      id: cart.id,
      deliveryMode: cart.deliveryMode,
      relayOption: cart.relayOption,
      homeRecipient: cart.homeRecipient,
      homeAddressLine1: cart.homeAddressLine1,
      homeAddressLine2: cart.homeAddressLine2,
      homePostalCode: cart.homePostalCode,
      homeCity: cart.homeCity,
      relayPointName: cart.relayPointName,
      relayAddress: cart.relayAddress,
      useWalletDiscount: cart.useWalletDiscount,
      items,
      subtotal,
      deliveryFee,
      availablePoints: userPoints,
      usedPoints,
      walletDiscount,
      total,
    };
  }

  private getDeliveryFee(
    deliveryMode: RewardDeliveryMode,
    relayOption: RewardRelayOption,
  ): number {
    if (
      deliveryMode === RewardDeliveryMode.RELAY &&
      relayOption === RewardRelayOption.PRIORITY
    ) {
      return RewardService.PRIORITY_RELAY_FEE;
    }

    return 0;
  }

  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private addImageUrl(reward: Reward): RewardWithImageUrl {
    return {
      ...reward,
      imageUrl: reward.image ? this.minioService.getFileUrl(reward.image) : null,
    };
  }
}
