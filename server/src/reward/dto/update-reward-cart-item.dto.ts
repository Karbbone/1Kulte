import { IsInt, Max, Min } from 'class-validator';

export class UpdateRewardCartItemDto {
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}
