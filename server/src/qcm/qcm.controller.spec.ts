import { Test, TestingModule } from '@nestjs/testing';
import { QcmController } from './qcm.controller';
import { QcmService } from './qcm.service';
import { AuthGuard } from '../user/auth.guard';

describe('QcmController', () => {
  let controller: QcmController;
  let qcmService: jest.Mocked<QcmService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QcmController],
      providers: [
        {
          provide: QcmService,
          useValue: {
            findQuestionsByTrailId: jest.fn(),
            getTrailProgress: jest.fn(),
            findQuestion: jest.fn(),
            createQuestion: jest.fn(),
            addAnswer: jest.fn(),
            deleteQuestion: jest.fn(),
            deleteAnswer: jest.fn(),
            answerQuestion: jest.fn(),
            getUserAnswers: jest.fn(),
            getTrailHistory: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<QcmController>(QcmController);
    qcmService = module.get(QcmService);
  });

  describe('findByTrail', () => {
    it('should call qcmService.findQuestionsByTrailId()', async () => {
      const expected = [{ id: 'q-1' }];
      qcmService.findQuestionsByTrailId.mockResolvedValue(expected as any);

      const result = await controller.findByTrail('trail-1');

      expect(qcmService.findQuestionsByTrailId).toHaveBeenCalledWith('trail-1');
      expect(result).toEqual(expected);
    });
  });

  describe('getTrailStatus', () => {
    it('should extract userId and call qcmService.getTrailProgress()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = { trailId: 'trail-1', completed: false };
      qcmService.getTrailProgress.mockResolvedValue(expected as any);

      const result = await controller.getTrailStatus('trail-1', req);

      expect(qcmService.getTrailProgress).toHaveBeenCalledWith('user-1', 'trail-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findQuestion', () => {
    it('should call qcmService.findQuestion(id)', async () => {
      const expected = { id: 'q-1' };
      qcmService.findQuestion.mockResolvedValue(expected as any);

      const result = await controller.findQuestion('q-1');

      expect(qcmService.findQuestion).toHaveBeenCalledWith('q-1');
      expect(result).toEqual(expected);
    });
  });

  describe('createQuestion', () => {
    it('should call qcmService.createQuestion(dto, file)', async () => {
      const dto = { question: 'Q?', trailId: 'trail-1' };
      const file = { originalname: 'img.png' } as Express.Multer.File;
      const expected = { id: 'q-1' };
      qcmService.createQuestion.mockResolvedValue(expected as any);

      const result = await controller.createQuestion(dto as any, file);

      expect(qcmService.createQuestion).toHaveBeenCalledWith(dto, file);
      expect(result).toEqual(expected);
    });
  });

  describe('addAnswer', () => {
    it('should call qcmService.addAnswer()', async () => {
      const body = { answer: 'A', isCorrect: true };
      const expected = { id: 'a-1' };
      qcmService.addAnswer.mockResolvedValue(expected as any);

      const result = await controller.addAnswer('q-1', body);

      expect(qcmService.addAnswer).toHaveBeenCalledWith('q-1', 'A', true);
      expect(result).toEqual(expected);
    });
  });

  describe('deleteQuestion', () => {
    it('should call qcmService.deleteQuestion(id)', async () => {
      qcmService.deleteQuestion.mockResolvedValue(undefined);

      await controller.deleteQuestion('q-1');

      expect(qcmService.deleteQuestion).toHaveBeenCalledWith('q-1');
    });
  });

  describe('deleteAnswer', () => {
    it('should call qcmService.deleteAnswer(id)', async () => {
      qcmService.deleteAnswer.mockResolvedValue(undefined);

      await controller.deleteAnswer('a-1');

      expect(qcmService.deleteAnswer).toHaveBeenCalledWith('a-1');
    });
  });

  describe('submitAnswer', () => {
    it('should extract userId and call qcmService.answerQuestion()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const dto = { answerId: 'a-1' };
      const expected = { isCorrect: true, pointsEarned: 10 };
      qcmService.answerQuestion.mockResolvedValue(expected as any);

      const result = await controller.submitAnswer('q-1', dto as any, req);

      expect(qcmService.answerQuestion).toHaveBeenCalledWith('user-1', 'q-1', 'a-1');
      expect(result).toEqual(expected);
    });
  });

  describe('getMyAnswers', () => {
    it('should extract userId and call qcmService.getUserAnswers()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = [{ id: 'ua-1' }];
      qcmService.getUserAnswers.mockResolvedValue(expected as any);

      const result = await controller.getMyAnswers(req);

      expect(qcmService.getUserAnswers).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('getTrailHistory', () => {
    it('should extract userId and call qcmService.getTrailHistory()', async () => {
      const req = { user: { user: { id: 'user-1' } } } as any;
      const expected = [{ trail: { id: 'trail-1' } }];
      qcmService.getTrailHistory.mockResolvedValue(expected as any);

      const result = await controller.getTrailHistory(req);

      expect(qcmService.getTrailHistory).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });
});
