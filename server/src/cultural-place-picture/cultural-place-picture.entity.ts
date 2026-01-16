import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CulturalPlace } from '../cultural-place/cultural-place.entity';

@Entity('cultural_place_pictures')
export class CulturalPlacePicture {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  path: string;

  @Column({ type: 'boolean', default: false })
  mainPicture: boolean;

  @ManyToOne(() => CulturalPlace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cultural_place_id' })
  culturalPlace: CulturalPlace;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
