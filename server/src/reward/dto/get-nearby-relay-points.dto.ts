import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude } from 'class-validator';

export class GetNearbyRelayPointsDto {
  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;
}
