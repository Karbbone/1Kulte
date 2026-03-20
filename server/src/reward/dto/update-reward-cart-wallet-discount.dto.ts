import { IsBoolean } from 'class-validator';

export class UpdateRewardCartWalletDiscountDto {
  @IsBoolean()
  useWalletDiscount: boolean;
}
