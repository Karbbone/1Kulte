import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export interface QcmAnswerInput {
  answer: string;
  isCorrect?: boolean;
}

export class CreateQcmQuestionDto {
  @IsUUID()
  @IsNotEmpty()
  trailId: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsOptional()
  image?: string;

  @Transform(({ value }) => (value ? parseInt(value, 10) : 0))
  @IsOptional()
  point?: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsOptional()
  answers?: QcmAnswerInput[];
}
