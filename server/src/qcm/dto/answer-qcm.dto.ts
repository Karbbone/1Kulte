import { IsNotEmpty, IsUUID } from 'class-validator';

export class AnswerQcmDto {
  @IsUUID()
  @IsNotEmpty()
  answerId: string;
}
