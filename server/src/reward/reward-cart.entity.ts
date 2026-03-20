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
import { User } from '../user/user.entity';
import { RewardDeliveryMode } from './reward-delivery-mode.enum';
import { RewardCartItem } from './reward-cart-item.entity';
import { RewardRelayOption } from './reward-relay-option.enum';

@Entity('reward_carts')
export class RewardCart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => RewardCartItem, (item) => item.cart)
  items: RewardCartItem[];

  @Column({
    type: 'enum',
    enum: RewardDeliveryMode,
    default: RewardDeliveryMode.HOME,
  })
  deliveryMode: RewardDeliveryMode;

  @Column({ type: 'varchar', length: 120, nullable: true })
  homeRecipient: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  homeAddressLine1: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  homeAddressLine2: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  homePostalCode: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  homeCity: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  relayPointName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  relayAddress: string | null;

  @Column({
    type: 'enum',
    enum: RewardRelayOption,
    default: RewardRelayOption.STANDARD,
  })
  relayOption: RewardRelayOption;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
