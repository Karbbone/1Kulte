import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../user/user.module';
import { QcmAnswer } from './qcm-answer.entity';
import { QcmQuestion } from './qcm-question.entity';
import { QcmController } from './qcm.controller';
import {
  QcmAnswerRepository,
  QcmQuestionRepository,
  UserQcmAnswerRepository,
} from './qcm.repository';
import { QcmService } from './qcm.service';
import { UserQcmAnswer } from './user-qcm-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QcmQuestion, QcmAnswer, UserQcmAnswer]),
    UsersModule,
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
  providers: [
    QcmService,
    QcmQuestionRepository,
    QcmAnswerRepository,
    UserQcmAnswerRepository,
  ],
  controllers: [QcmController],
  exports: [QcmService],
})
export class QcmModule {}
