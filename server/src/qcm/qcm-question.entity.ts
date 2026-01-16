import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trail } from '../trail/trail.entity';
import { QcmAnswer } from './qcm-answer.entity';

@Entity('qcm_questions')
export class QcmQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Trail, (trail) => trail.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trail_id' })
  trail: Trail;

  @Column({ type: 'text', nullable: false })
  question: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ type: 'int', default: 0 })
  point: number;

  @OneToMany(() => QcmAnswer, (answer) => answer.qcmQuestion)
  answers: QcmAnswer[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
