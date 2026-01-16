import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../user/auth.guard';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceService } from './cultural-place.service';
import { CreateCulturalPlaceDto } from './dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from './dto/update-cultural-place.dto';

@Controller('cultural-places')
export class CulturalPlaceController {
  constructor(private readonly culturalPlaceService: CulturalPlaceService) {}

  @Get()
  findAll(): Promise<CulturalPlace[]> {
    return this.culturalPlaceService.findAll();
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
