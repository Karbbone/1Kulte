import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { QcmQuestion } from './qcm-question.entity';
import { QcmAnswer } from './qcm-answer.entity';

@Entity('user_qcm_answers')
export class UserQcmAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => QcmQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'qcm_question_id' })
  qcmQuestion: QcmQuestion;

  @ManyToOne(() => QcmAnswer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'qcm_answer_id' })
  qcmAnswer: QcmAnswer;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'int', default: 0 })
  pointsEarned: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
