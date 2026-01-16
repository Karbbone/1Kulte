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
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';
import { Trail } from './trail.entity';
import { TrailService } from './trail.service';

@Controller('trails')
export class TrailController {
  constructor(private readonly trailService: TrailService) {}

  @Get()
  findAll(): Promise<Trail[]> {
    return this.trailService.findAll();
  }

  @Get('cultural-place/:culturalPlaceId')
  findByCulturalPlace(
    @Param('culturalPlaceId') culturalPlaceId: string,
  ): Promise<Trail[]> {
    return this.trailService.findByCulturalPlaceId(culturalPlaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Trail> {
    return this.trailService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTrailDto: CreateTrailDto): Promise<Trail> {
    return this.trailService.create(createTrailDto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTrailDto: UpdateTrailDto,
  ): Promise<Trail> {
    return this.trailService.update(id, updateTrailDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.trailService.remove(id);
  }
}
