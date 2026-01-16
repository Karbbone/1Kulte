import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../user/auth.guard';
import { User } from '../user/user.entity';
import { Favorite } from './favorite.entity';
import { FavoriteService } from './favorite.service';

interface AuthenticatedRequest extends Request {
  user: { user: User };
}

@Controller('favorites')
@UseGuards(AuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get('me')
  findMyFavorites(@Req() req: AuthenticatedRequest): Promise<Favorite[]> {
    const userId = req.user.user.id;
    return this.favoriteService.findUserFavorites(userId);
  }

  @Post(':culturalPlaceId')
  addFavorite(
    @Param('culturalPlaceId') culturalPlaceId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Favorite> {
    const userId = req.user.user.id;
    return this.favoriteService.addFavorite(userId, culturalPlaceId);
  }

  @Delete(':culturalPlaceId')
  removeFavorite(
    @Param('culturalPlaceId') culturalPlaceId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const userId = req.user.user.id;
    return this.favoriteService.removeFavorite(userId, culturalPlaceId);
  }
}
