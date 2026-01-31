import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../user/auth.guard';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceService } from './cultural-place.service';
import { CreateCulturalPlaceDto } from './dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from './dto/update-cultural-place.dto';

interface JwtPayload {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Controller('cultural-places')
export class CulturalPlaceController {
  constructor(private readonly culturalPlaceService: CulturalPlaceService) {}

  @Get()
  findAll(): Promise<CulturalPlace[]> {
    return this.culturalPlaceService.findAll();
  }

  /**
   * GET /cultural-places/popular
   * Retourne les 5 lieux les plus populaires (basé sur le nombre de favoris)
   */
  @Get('popular')
  findPopular(): Promise<(CulturalPlace & { favoriteCount: number })[]> {
    return this.culturalPlaceService.findPopular(5);
  }

  /**
   * GET /cultural-places/recommendations
   * Retourne 5 recommandations personnalisées pour l'utilisateur connecté
   */
  @UseGuards(AuthGuard)
  @Get('recommendations')
  findRecommendations(
    @Req() request: Request & { user: JwtPayload },
  ): Promise<CulturalPlace[]> {
    const userId = request.user.user.id;
    return this.culturalPlaceService.findRecommendations(userId, 5);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CulturalPlace | null> {
    return this.culturalPlaceService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createCulturalPlaceDto: CreateCulturalPlaceDto,
  ): Promise<CulturalPlace> {
    return this.culturalPlaceService.create(createCulturalPlaceDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCulturalPlaceDto: UpdateCulturalPlaceDto,
  ): Promise<CulturalPlace | null> {
    return this.culturalPlaceService.update(id, updateCulturalPlaceDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.culturalPlaceService.remove(id);
  }
}
