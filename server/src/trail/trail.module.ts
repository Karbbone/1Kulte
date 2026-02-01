import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrailController } from './trail.controller';
import { Trail } from './trail.entity';
import { TrailRepository } from './trail.repository';
import { TrailService } from './trail.service';
import { QRCodeService } from './qrcode.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trail]),
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
  providers: [TrailService, TrailRepository, QRCodeService],
  controllers: [TrailController],
  exports: [TrailService, QRCodeService],
})
export class TrailModule {}
