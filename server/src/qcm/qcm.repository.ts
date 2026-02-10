import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { QcmQuestion } from './qcm-question.entity';
import { QcmAnswer } from './qcm-answer.entity';
import { UserQcmAnswer } from './user-qcm-answer.entity';

@Injectable()
export class QcmQuestionRepository {
  constructor(
    @InjectRepository(QcmQuestion)
    private readonly repository: Repository<QcmQuestion>,
  ) {}

  findByTrailId(trailId: string): Promise<QcmQuestion[]> {
    return this.repository.find({
      where: { trail: { id: trailId } },
      relations: ['answers'],
    });
  }

  findOne(id: string): Promise<QcmQuestion | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['answers', 'trail'],
    });
  }

  create(data: DeepPartial<QcmQuestion>): QcmQuestion {
    return this.repository.create(data);
  }

  save(question: QcmQuestion): Promise<QcmQuestion> {
    return this.repository.save(question);
  }

  update(id: string, data: Partial<QcmQuestion>): Promise<any> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}

@Injectable()
export class QcmAnswerRepository {
  constructor(
    @InjectRepository(QcmAnswer)
    private readonly repository: Repository<QcmAnswer>,
  ) {}

  findOne(id: string): Promise<QcmAnswer | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['qcmQuestion'],
    });
  }

  findByQuestionId(questionId: string): Promise<QcmAnswer[]> {
    return this.repository.find({
      where: { qcmQuestion: { id: questionId } },
    });
  }

  create(data: DeepPartial<QcmAnswer>): QcmAnswer {
    return this.repository.create(data);
  }

  save(answer: QcmAnswer): Promise<QcmAnswer> {
    return this.repository.save(answer);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}

@Injectable()
export class UserQcmAnswerRepository {
  constructor(
    @InjectRepository(UserQcmAnswer)
    private readonly repository: Repository<UserQcmAnswer>,
  ) {}

  findByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<UserQcmAnswer | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        qcmQuestion: { id: questionId },
      },
    });
  }

  findByUser(userId: string): Promise<UserQcmAnswer[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['qcmQuestion', 'qcmAnswer'],
    });
  }

  findByUserAndTrail(
    userId: string,
    trailId: string,
  ): Promise<UserQcmAnswer[]> {
    return this.repository
      .createQueryBuilder('userAnswer')
      .leftJoinAndSelect('userAnswer.qcmQuestion', 'question')
      .leftJoinAndSelect('userAnswer.qcmAnswer', 'answer')
      .where('userAnswer.user_id = :userId', { userId })
      .andWhere('question.trail_id = :trailId', { trailId })
      .getMany();
  }

  create(data: DeepPartial<UserQcmAnswer>): UserQcmAnswer {
    return this.repository.create(data);
  }

  save(userAnswer: UserQcmAnswer): Promise<UserQcmAnswer> {
    return this.repository.save(userAnswer);
  }

  findRecentTrailsByUser(
    userId: string,
    limit: number = 5,
  ): Promise<{ trail: any; culturalPlace: any; lastPlayedAt: string }[]> {
    return this.repository
      .createQueryBuilder('userAnswer')
      .innerJoin('userAnswer.qcmQuestion', 'question')
      .innerJoin('question.trail', 'trail')
      .innerJoin('trail.culturalPlace', 'culturalPlace')
      .select('trail.id', 'trailId')
      .addSelect('trail.name', 'trailName')
      .addSelect('trail.description', 'trailDescription')
      .addSelect('trail.durationMinute', 'trailDurationMinute')
      .addSelect('trail.difficulty', 'trailDifficulty')
      .addSelect('culturalPlace.id', 'culturalPlaceId')
      .addSelect('culturalPlace.name', 'culturalPlaceName')
      .addSelect('culturalPlace.description', 'culturalPlaceDescription')
      .addSelect('culturalPlace.postCode', 'culturalPlacePostCode')
      .addSelect('culturalPlace.city', 'culturalPlaceCity')
      .addSelect('culturalPlace.latitude', 'culturalPlaceLatitude')
      .addSelect('culturalPlace.longitude', 'culturalPlaceLongitude')
      .addSelect('culturalPlace.type', 'culturalPlaceType')
      .addSelect('culturalPlace.createdAt', 'culturalPlaceCreatedAt')
      .addSelect('culturalPlace.updatedAt', 'culturalPlaceUpdatedAt')
      .addSelect('MAX(userAnswer.createdAt)', 'lastPlayedAt')
      .where('userAnswer.user_id = :userId', { userId })
      .groupBy('trail.id')
      .addGroupBy('culturalPlace.id')
      .orderBy('lastPlayedAt', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}
