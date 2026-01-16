import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTrailDto {
  @IsUUID()
  @IsNotEmpty()
  culturalPlaceId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  durationMinute?: number;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
