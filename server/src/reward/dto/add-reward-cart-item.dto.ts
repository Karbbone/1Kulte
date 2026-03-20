import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AddRewardCartItemDto {
  @IsUUID()
  rewardId: string;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  quantity?: number;
}
