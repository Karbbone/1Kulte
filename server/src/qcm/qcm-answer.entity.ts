import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QcmQuestion } from './qcm-question.entity';

@Entity('qcm_answers')
export class QcmAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QcmQuestion, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'qcm_question_id' })
  qcmQuestion: QcmQuestion;

  @Column({ type: 'text', nullable: false })
  answer: string;

  @Column({ type: 'boolean', default: false })
  isCorrect: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
