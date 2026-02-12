import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QcmService } from './qcm.service';
import {
  QcmQuestionRepository,
  QcmAnswerRepository,
  UserQcmAnswerRepository,
} from './qcm.repository';
import { UserRepository } from '../user/user.repository';
import { MinioService } from '../shares/minio/minio.service';
import { QcmQuestion } from './qcm-question.entity';
import { QcmAnswer } from './qcm-answer.entity';
import { UserQcmAnswer } from './user-qcm-answer.entity';
import { User } from '../user/user.entity';

describe('QcmService', () => {
  let service: QcmService;
  let questionRepository: jest.Mocked<QcmQuestionRepository>;
  let answerRepository: jest.Mocked<QcmAnswerRepository>;
  let userAnswerRepository: jest.Mocked<UserQcmAnswerRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let minioService: jest.Mocked<MinioService>;

  const mockQuestion = {
    id: 'q-1',
    question: 'What is art?',
    image: 'qcm/trail-1/img.png',
    point: 10,
    trail: { id: 'trail-1' },
    answers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as QcmQuestion;

  const mockQuestionNoImage = {
    ...mockQuestion,
    id: 'q-2',
    image: null,
  } as unknown as QcmQuestion;

  const mockCorrectAnswer = {
    id: 'a-1',
    answer: 'Expression',
    isCorrect: true,
    qcmQuestion: { id: 'q-1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as QcmAnswer;

  const mockWrongAnswer = {
    id: 'a-2',
    answer: 'Nothing',
    isCorrect: false,
    qcmQuestion: { id: 'q-1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as QcmAnswer;

  const mockUser = {
    id: 'user-1',
    points: 50,
  } as unknown as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QcmService,
        {
          provide: QcmQuestionRepository,
          useValue: {
            findByTrailId: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: QcmAnswerRepository,
          useValue: {
            findOne: jest.fn(),
            findByQuestionId: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserQcmAnswerRepository,
          useValue: {
            findByUserAndQuestion: jest.fn(),
            findByUser: jest.fn(),
            findByUserAndTrail: jest.fn(),
            findRecentTrailsByUser: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadFile: jest.fn(),
            getFileUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QcmService>(QcmService);
    questionRepository = module.get(QcmQuestionRepository);
    answerRepository = module.get(QcmAnswerRepository);
    userAnswerRepository = module.get(UserQcmAnswerRepository);
    userRepository = module.get(UserRepository);
    minioService = module.get(MinioService);
  });

  describe('findQuestionsByTrailId', () => {
    it('should return questions with imageUrl', async () => {
      questionRepository.findByTrailId.mockResolvedValue([mockQuestion]);
      minioService.getFileUrl.mockReturnValue('http://minio/qcm/trail-1/img.png');

      const result = await service.findQuestionsByTrailId('trail-1');

      expect(result).toHaveLength(1);
      expect(result[0].imageUrl).toBe('http://minio/qcm/trail-1/img.png');
    });

    it('should return imageUrl: null if no image', async () => {
      questionRepository.findByTrailId.mockResolvedValue([mockQuestionNoImage]);

      const result = await service.findQuestionsByTrailId('trail-1');

      expect(result[0].imageUrl).toBeNull();
    });
  });

  describe('findQuestion', () => {
    it('should return question with imageUrl', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://minio/qcm/trail-1/img.png');

      const result = await service.findQuestion('q-1');

      expect(result.imageUrl).toBe('http://minio/qcm/trail-1/img.png');
    });

    it('should throw NotFoundException if question not found', async () => {
      questionRepository.findOne.mockResolvedValue(null);

      await expect(service.findQuestion('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createQuestion', () => {
    it('should create a question without image', async () => {
      const dto = { question: 'Q?', trailId: 'trail-1', point: 10 };
      const created = { ...mockQuestion };
      questionRepository.create.mockReturnValue(created as QcmQuestion);
      questionRepository.save.mockResolvedValue(created as QcmQuestion);
      questionRepository.findOne.mockResolvedValue(created as QcmQuestion);
      minioService.getFileUrl.mockReturnValue('http://minio/qcm/trail-1/img.png');

      const result = await service.createQuestion(dto as any);

      expect(minioService.uploadFile).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should upload image if file is provided', async () => {
      const dto = { question: 'Q?', trailId: 'trail-1', point: 10 };
      const file = { originalname: 'img.png' } as Express.Multer.File;
      minioService.uploadFile.mockResolvedValue('qcm/trail-1/img.png');
      const created = { ...mockQuestion };
      questionRepository.create.mockReturnValue(created as QcmQuestion);
      questionRepository.save.mockResolvedValue(created as QcmQuestion);
      questionRepository.findOne.mockResolvedValue(created as QcmQuestion);
      minioService.getFileUrl.mockReturnValue('http://minio/qcm/trail-1/img.png');

      await service.createQuestion(dto as any, file);

      expect(minioService.uploadFile).toHaveBeenCalledWith(file, 'qcm/trail-1');
    });

    it('should create answers if provided in dto', async () => {
      const dto = {
        question: 'Q?',
        trailId: 'trail-1',
        point: 10,
        answers: [{ answer: 'A', isCorrect: true }],
      };
      const created = { ...mockQuestion };
      questionRepository.create.mockReturnValue(created as QcmQuestion);
      questionRepository.save.mockResolvedValue(created as QcmQuestion);
      answerRepository.create.mockReturnValue(mockCorrectAnswer);
      answerRepository.save.mockResolvedValue(mockCorrectAnswer);
      questionRepository.findOne.mockResolvedValue(created as QcmQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');

      await service.createQuestion(dto as any);

      expect(answerRepository.create).toHaveBeenCalled();
      expect(answerRepository.save).toHaveBeenCalled();
    });
  });

  describe('addAnswer', () => {
    it('should add an answer to a question', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      answerRepository.create.mockReturnValue(mockCorrectAnswer);
      answerRepository.save.mockResolvedValue(mockCorrectAnswer);

      const result = await service.addAnswer('q-1', 'Expression', true);

      expect(result).toEqual(mockCorrectAnswer);
    });

    it('should throw NotFoundException if question not found', async () => {
      questionRepository.findOne.mockResolvedValue(null);

      await expect(service.addAnswer('nonexistent', 'A', true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteQuestion', () => {
    it('should delete the question', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      questionRepository.delete.mockResolvedValue(undefined);

      await service.deleteQuestion('q-1');

      expect(questionRepository.delete).toHaveBeenCalledWith('q-1');
    });

    it('should throw NotFoundException if question not found', async () => {
      questionRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteQuestion('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAnswer', () => {
    it('should delete the answer', async () => {
      answerRepository.findOne.mockResolvedValue(mockCorrectAnswer);
      answerRepository.delete.mockResolvedValue(undefined);

      await service.deleteAnswer('a-1');

      expect(answerRepository.delete).toHaveBeenCalledWith('a-1');
    });

    it('should throw NotFoundException if answer not found', async () => {
      answerRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAnswer('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('answerQuestion', () => {
    it('should award points on correct first answer', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(null);
      answerRepository.findOne.mockResolvedValue(mockCorrectAnswer);
      answerRepository.findByQuestionId.mockResolvedValue([mockCorrectAnswer, mockWrongAnswer]);
      const user = { ...mockUser, points: 50 };
      userRepository.findOne.mockResolvedValue(user);
      const userAnswer = { id: 'ua-1' } as unknown as UserQcmAnswer;
      userAnswerRepository.create.mockReturnValue(userAnswer);
      userAnswerRepository.save.mockResolvedValue(userAnswer);

      const result = await service.answerQuestion('user-1', 'q-1', 'a-1');

      expect(result.isCorrect).toBe(true);
      expect(result.pointsEarned).toBe(10);
      expect(user.points).toBe(60);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('should not award points on wrong first answer', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(null);
      answerRepository.findOne.mockResolvedValue(mockWrongAnswer);
      answerRepository.findByQuestionId.mockResolvedValue([mockCorrectAnswer, mockWrongAnswer]);
      const user = { ...mockUser, points: 50 };
      userRepository.findOne.mockResolvedValue(user);
      const userAnswer = { id: 'ua-1' } as unknown as UserQcmAnswer;
      userAnswerRepository.create.mockReturnValue(userAnswer);
      userAnswerRepository.save.mockResolvedValue(userAnswer);

      const result = await service.answerQuestion('user-1', 'q-1', 'a-2');

      expect(result.isCorrect).toBe(false);
      expect(result.pointsEarned).toBe(0);
      expect(user.points).toBe(50);
    });

    it('should throw BadRequestException if already answered correctly', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      const existing = { isCorrect: true } as UserQcmAnswer;
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(existing);

      await expect(service.answerQuestion('user-1', 'q-1', 'a-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update existing wrong answer with correct answer and award points', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      const existing = {
        isCorrect: false,
        qcmAnswer: { id: 'a-2' },
        pointsEarned: 0,
      } as unknown as UserQcmAnswer;
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(existing);
      answerRepository.findOne.mockResolvedValue(mockCorrectAnswer);
      answerRepository.findByQuestionId.mockResolvedValue([mockCorrectAnswer, mockWrongAnswer]);
      const user = { ...mockUser, points: 50 };
      userRepository.findOne.mockResolvedValue(user);
      userAnswerRepository.save.mockResolvedValue(existing);

      const result = await service.answerQuestion('user-1', 'q-1', 'a-1');

      expect(result.isCorrect).toBe(true);
      expect(user.points).toBe(60);
    });

    it('should throw BadRequestException if answer does not match question', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(null);
      const wrongQuestionAnswer = {
        ...mockCorrectAnswer,
        qcmQuestion: { id: 'q-other' },
      } as unknown as QcmAnswer;
      answerRepository.findOne.mockResolvedValue(wrongQuestionAnswer);

      await expect(service.answerQuestion('user-1', 'q-1', 'a-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if answer not found', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(null);
      answerRepository.findOne.mockResolvedValue(null);

      await expect(service.answerQuestion('user-1', 'q-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      questionRepository.findOne.mockResolvedValue(mockQuestion);
      minioService.getFileUrl.mockReturnValue('http://url');
      userAnswerRepository.findByUserAndQuestion.mockResolvedValue(null);
      answerRepository.findOne.mockResolvedValue(mockCorrectAnswer);
      answerRepository.findByQuestionId.mockResolvedValue([mockCorrectAnswer]);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.answerQuestion('user-1', 'q-1', 'a-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserAnswers', () => {
    it('should return user answers', async () => {
      const answers = [{ id: 'ua-1' }] as unknown as UserQcmAnswer[];
      userAnswerRepository.findByUser.mockResolvedValue(answers);

      const result = await service.getUserAnswers('user-1');

      expect(userAnswerRepository.findByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(answers);
    });
  });

  describe('getTrailHistory', () => {
    it('should map raw results to TrailHistoryItem', async () => {
      const raw = [
        {
          trailId: 'trail-1',
          trailName: 'Trail',
          trailDescription: 'desc',
          trailDurationMinute: 30,
          trailDifficulty: 'easy',
          culturalPlaceId: 'place-1',
          culturalPlaceName: 'Louvre',
          culturalPlaceDescription: 'museum',
          culturalPlacePostCode: '75001',
          culturalPlaceCity: 'Paris',
          culturalPlaceLatitude: 48.86,
          culturalPlaceLongitude: 2.34,
          culturalPlaceType: 'art',
          culturalPlaceCreatedAt: '2024-01-01',
          culturalPlaceUpdatedAt: '2024-01-01',
          lastPlayedAt: '2024-06-01',
        },
      ];
      userAnswerRepository.findRecentTrailsByUser.mockResolvedValue(raw);

      const result = await service.getTrailHistory('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].trail.id).toBe('trail-1');
      expect(result[0].culturalPlace.id).toBe('place-1');
      expect(result[0].lastPlayedAt).toBe('2024-06-01');
    });

    it('should return empty array if no history', async () => {
      userAnswerRepository.findRecentTrailsByUser.mockResolvedValue([]);

      const result = await service.getTrailHistory('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getTrailProgress', () => {
    it('should calculate progress correctly', async () => {
      const questions = [
        { ...mockQuestion, point: 10 },
        { ...mockQuestion, id: 'q-2', point: 20 },
      ] as unknown as QcmQuestion[];
      questionRepository.findByTrailId.mockResolvedValue(questions);

      const userAnswers = [
        { isCorrect: true, pointsEarned: 10 },
        { isCorrect: false, pointsEarned: 0 },
      ] as unknown as UserQcmAnswer[];
      userAnswerRepository.findByUserAndTrail.mockResolvedValue(userAnswers);

      const result = await service.getTrailProgress('user-1', 'trail-1');

      expect(result.totalQuestions).toBe(2);
      expect(result.totalPoints).toBe(30);
      expect(result.answeredQuestions).toBe(2);
      expect(result.correctAnswers).toBe(1);
      expect(result.pointsEarned).toBe(10);
      expect(result.missingPoints).toBe(20);
      expect(result.completed).toBe(true);
    });

    it('should return completed: false if not all questions answered', async () => {
      questionRepository.findByTrailId.mockResolvedValue([mockQuestion] as QcmQuestion[]);
      userAnswerRepository.findByUserAndTrail.mockResolvedValue([]);

      const result = await service.getTrailProgress('user-1', 'trail-1');

      expect(result.completed).toBe(false);
      expect(result.answeredQuestions).toBe(0);
    });

    it('should return completed: false if no questions exist', async () => {
      questionRepository.findByTrailId.mockResolvedValue([]);
      userAnswerRepository.findByUserAndTrail.mockResolvedValue([]);

      const result = await service.getTrailProgress('user-1', 'trail-1');

      expect(result.completed).toBe(false);
      expect(result.totalQuestions).toBe(0);
    });
  });
});
