import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AuthGuard } from '../user/auth.guard';
import { User } from '../user/user.entity';
import { AnswerQcmDto } from './dto/answer-qcm.dto';
import { CreateQcmQuestionDto } from './dto/create-qcm-question.dto';
import {
  AnswerResult,
  QcmQuestionWithUrl,
  QcmService,
  TrailHistoryItem,
  TrailProgress,
} from './qcm.service';

interface AuthenticatedRequest extends Request {
  user: { user: User };
}

@Controller('qcm')
export class QcmController {
  constructor(private readonly qcmService: QcmService) {}

  @Get('trail/:trailId')
  findByTrail(
    @Param('trailId') trailId: string,
  ): Promise<QcmQuestionWithUrl[]> {
    return this.qcmService.findQuestionsByTrailId(trailId);
  }

  @UseGuards(AuthGuard)
  @Get('trail/:trailId/status')
  getTrailStatus(
    @Param('trailId') trailId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<TrailProgress> {
    const userId = req.user.user.id;
    return this.qcmService.getTrailProgress(userId, trailId);
  }

  @Get('question/:id')
  findQuestion(@Param('id') id: string): Promise<QcmQuestionWithUrl> {
    return this.qcmService.findQuestion(id);
  }

  @UseGuards(AuthGuard)
  @Post('question')
  @UseInterceptors(FileInterceptor('image'))
  createQuestion(
    @Body() createQuestionDto: CreateQcmQuestionDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<QcmQuestionWithUrl> {
    return this.qcmService.createQuestion(createQuestionDto, file);
  }

  @UseGuards(AuthGuard)
  @Post('question/:questionId/answer')
  addAnswer(
    @Param('questionId') questionId: string,
    @Body() body: { answer: string; isCorrect: boolean },
  ) {
    return this.qcmService.addAnswer(questionId, body.answer, body.isCorrect);
  }

  @UseGuards(AuthGuard)
  @Delete('question/:id')
  deleteQuestion(@Param('id') id: string): Promise<void> {
    return this.qcmService.deleteQuestion(id);
  }

  @UseGuards(AuthGuard)
  @Delete('answer/:id')
  deleteAnswer(@Param('id') id: string): Promise<void> {
    return this.qcmService.deleteAnswer(id);
  }

  @UseGuards(AuthGuard)
  @Post('question/:questionId/submit')
  submitAnswer(
    @Param('questionId') questionId: string,
    @Body() answerDto: AnswerQcmDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AnswerResult> {
    const userId = req.user.user.id;
    return this.qcmService.answerQuestion(
      userId,
      questionId,
      answerDto.answerId,
    );
  }

  @UseGuards(AuthGuard)
  @Get('my-answers')
  getMyAnswers(@Req() req: AuthenticatedRequest) {
    const userId = req.user.user.id;
    return this.qcmService.getUserAnswers(userId);
  }

  @UseGuards(AuthGuard)
  @Get('trail-history')
  getTrailHistory(
    @Req() req: AuthenticatedRequest,
  ): Promise<TrailHistoryItem[]> {
    const userId = req.user.user.id;
    return this.qcmService.getTrailHistory(userId);
  }
}
