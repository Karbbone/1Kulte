import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CulturalPlace } from '../cultural-place/cultural-place.entity';
import { User } from '../user/user.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CulturalPlace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cultural_place_id' })
  culturalPlace: CulturalPlace;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
