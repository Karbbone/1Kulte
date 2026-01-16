import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulturalPlacePictureController } from './cultural-place-picture.controller';
import { CulturalPlacePicture } from './cultural-place-picture.entity';
import { CulturalPlacePictureRepository } from './cultural-place-picture.repository';
import { CulturalPlacePictureService } from './cultural-place-picture.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CulturalPlacePicture]),
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
  providers: [CulturalPlacePictureService, CulturalPlacePictureRepository],
  controllers: [CulturalPlacePictureController],
  exports: [CulturalPlacePictureService],
})
export class CulturalPlacePictureModule {}
