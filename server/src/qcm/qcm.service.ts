import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MinioService } from '../shares/minio/minio.service';
import { UserRepository } from '../user/user.repository';
import { CreateQcmQuestionDto } from './dto/create-qcm-question.dto';
import { QcmAnswer } from './qcm-answer.entity';
import { QcmQuestion } from './qcm-question.entity';
import {
  QcmAnswerRepository,
  QcmQuestionRepository,
  UserQcmAnswerRepository,
} from './qcm.repository';

export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: QcmAnswer;
  message: string;
}

export interface QcmQuestionWithUrl extends QcmQuestion {
  imageUrl: string | null;
}

export interface TrailProgress {
  trailId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  pointsEarned: number;
  missingPoints: number;
  completed: boolean;
}

@Injectable()
export class QcmService {
  constructor(
    private readonly questionRepository: QcmQuestionRepository,
    private readonly answerRepository: QcmAnswerRepository,
    private readonly userAnswerRepository: UserQcmAnswerRepository,
    private readonly userRepository: UserRepository,
    private readonly minioService: MinioService,
  ) {}

  private addImageUrl(question: QcmQuestion): QcmQuestionWithUrl {
    return {
      ...question,
      imageUrl: question.image
        ? this.minioService.getFileUrl(question.image)
        : null,
    };
  }

  async findQuestionsByTrailId(trailId: string): Promise<QcmQuestionWithUrl[]> {
    const questions = await this.questionRepository.findByTrailId(trailId);
    return questions.map((q) => this.addImageUrl(q));
  }

  async findQuestion(id: string): Promise<QcmQuestionWithUrl> {
    const question = await this.questionRepository.findOne(id);
    if (!question) {
      throw new NotFoundException('Question non trouvée');
    }
    return this.addImageUrl(question);
  }

  async createQuestion(
    data: CreateQcmQuestionDto,
    file?: Express.Multer.File,
  ): Promise<QcmQuestionWithUrl> {
    let imagePath: string | undefined;

    if (file) {
      const folder = `qcm/${data.trailId}`;
      imagePath = await this.minioService.uploadFile(file, folder);
    }

    const question = this.questionRepository.create({
      question: data.question,
      image: imagePath,
      point: data.point || 0,
      trail: { id: data.trailId },
    });

    const savedQuestion = await this.questionRepository.save(question);

    if (data.answers && data.answers.length > 0) {
      for (const answerData of data.answers) {
        const answer = this.answerRepository.create({
          answer: answerData.answer,
          isCorrect: answerData.isCorrect || false,
          qcmQuestion: { id: savedQuestion.id },
        });
        await this.answerRepository.save(answer);
      }
    }

    return this.findQuestion(savedQuestion.id);
  }

  async addAnswer(
    questionId: string,
    answer: string,
    isCorrect: boolean,
  ): Promise<QcmAnswer> {
    await this.findQuestion(questionId);

    const qcmAnswer = this.answerRepository.create({
      answer,
      isCorrect,
      qcmQuestion: { id: questionId },
    });

    return this.answerRepository.save(qcmAnswer);
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.findQuestion(id);
    await this.questionRepository.delete(id);
  }

  async deleteAnswer(id: string): Promise<void> {
    const answer = await this.answerRepository.findOne(id);
    if (!answer) {
      throw new NotFoundException('Réponse non trouvée');
    }
    await this.answerRepository.delete(id);
  }

  async answerQuestion(
    userId: string,
    questionId: string,
    answerId: string,
  ): Promise<AnswerResult> {
    const question = await this.findQuestion(questionId);

    // Vérifier si l'utilisateur a déjà répondu
    const existingAnswer =
      await this.userAnswerRepository.findByUserAndQuestion(userId, questionId);

    if (existingAnswer?.isCorrect) {
      throw new BadRequestException(
        'Vous avez déjà répondu correctement à cette question',
      );
    }

    // Récupérer la réponse choisie
    const selectedAnswer = await this.answerRepository.findOne(answerId);
    if (!selectedAnswer) {
      throw new NotFoundException('Réponse non trouvée');
    }

    if (selectedAnswer.qcmQuestion.id !== questionId) {
      throw new BadRequestException(
        'Cette réponse ne correspond pas à cette question',
      );
    }

    // Trouver la bonne réponse
    const answers = await this.answerRepository.findByQuestionId(questionId);
    const correctAnswer = answers.find((a) => a.isCorrect);

    const isCorrect = selectedAnswer.isCorrect;
    const pointsEarned = isCorrect ? question.point : 0;

    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    let pointsToAdd = 0;
    if (existingAnswer) {
      existingAnswer.qcmAnswer = { id: answerId } as QcmAnswer;
      existingAnswer.isCorrect = isCorrect;
      existingAnswer.pointsEarned = isCorrect ? question.point : 0;
      await this.userAnswerRepository.save(existingAnswer);

      if (isCorrect) {
        pointsToAdd = question.point;
      }
    } else {
      const userAnswer = this.userAnswerRepository.create({
        user: { id: userId },
        qcmQuestion: { id: questionId },
        qcmAnswer: { id: answerId },
        isCorrect,
        pointsEarned,
      });
      await this.userAnswerRepository.save(userAnswer);

      if (isCorrect) {
        pointsToAdd = pointsEarned;
      }
    }

    if (pointsToAdd > 0) {
      user.points += pointsToAdd;
      await this.userRepository.save(user);
    }

    return {
      isCorrect,
      pointsEarned: pointsToAdd,
      correctAnswer: correctAnswer!,
      message: isCorrect
        ? `Bonne réponse ! +${pointsEarned} points`
        : `Mauvaise réponse. La bonne réponse était : ${correctAnswer?.answer}`,
    };
  }

  async getUserAnswers(userId: string) {
    return this.userAnswerRepository.findByUser(userId);
  }

  async getTrailProgress(
    userId: string,
    trailId: string,
  ): Promise<TrailProgress> {
    const questions = await this.questionRepository.findByTrailId(trailId);
    const userAnswers = await this.userAnswerRepository.findByUserAndTrail(
      userId,
      trailId,
    );

    const totalPoints = questions.reduce((sum, q) => sum + (q.point || 0), 0);
    const pointsEarned = userAnswers.reduce(
      (sum, a) => sum + (a.pointsEarned || 0),
      0,
    );
    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
    const answeredQuestions = userAnswers.length;

    return {
      trailId,
      totalQuestions: questions.length,
      answeredQuestions,
      correctAnswers,
      totalPoints,
      pointsEarned,
      missingPoints: Math.max(totalPoints - pointsEarned, 0),
      completed: questions.length > 0 && answeredQuestions >= questions.length,
    };
  }
}
