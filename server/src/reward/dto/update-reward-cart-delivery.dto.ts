import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RewardDeliveryMode } from '../reward-delivery-mode.enum';
import { RewardRelayOption } from '../reward-relay-option.enum';

export class UpdateRewardCartDeliveryDto {
  @IsEnum(RewardDeliveryMode)
  deliveryMode: RewardDeliveryMode;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  homeRecipient?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  homeAddressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  homeAddressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  homePostalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  homeCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  relayPointName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  relayAddress?: string;

  @IsOptional()
  @IsEnum(RewardRelayOption)
  relayOption?: RewardRelayOption;
}
