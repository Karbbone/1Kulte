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
import { CulturalPlace } from '../cultural-place/cultural-place.entity';
import { QcmQuestion } from '../qcm/qcm-question.entity';

@Entity('trails')
export class Trail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CulturalPlace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cultural_place_id' })
  culturalPlace: CulturalPlace;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  durationMinute: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  difficulty: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => QcmQuestion, (question) => question.trail)
  questions: QcmQuestion[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
