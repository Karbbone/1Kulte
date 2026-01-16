import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../user/auth.guard';
import {
  CulturalPlacePictureService,
  CulturalPlacePictureWithUrl,
} from './cultural-place-picture.service';

@Controller('cultural-places/:culturalPlaceId/pictures')
export class CulturalPlacePictureController {
  constructor(
    private readonly pictureService: CulturalPlacePictureService,
  ) {}

  @Get()
  findAll(
    @Param('culturalPlaceId') culturalPlaceId: string,
  ): Promise<CulturalPlacePictureWithUrl[]> {
    return this.pictureService.findByCulturalPlaceId(culturalPlaceId);
  }

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('culturalPlaceId') culturalPlaceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('mainPicture') mainPicture?: string,
  ): Promise<CulturalPlacePictureWithUrl> {
    const isMain = mainPicture === 'true';
    return this.pictureService.upload(culturalPlaceId, file, isMain);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/main')
  setMainPicture(@Param('id') id: string): Promise<CulturalPlacePictureWithUrl> {
    return this.pictureService.setMainPicture(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.pictureService.delete(id);
  }
}
