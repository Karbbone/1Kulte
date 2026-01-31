import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../favorite/favorite.entity';
import { CulturalPlaceController } from './cultural-place.controller';
import { CulturalPlace } from './cultural-place.entity';
import { CulturalPlaceRepository } from './cultural-place.repository';
import { CulturalPlaceService } from './cultural-place.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CulturalPlace, Favorite]),
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
  providers: [CulturalPlaceService, CulturalPlaceRepository],
  controllers: [CulturalPlaceController],
  exports: [CulturalPlaceService],
})
export class CulturalPlaceModule {}
