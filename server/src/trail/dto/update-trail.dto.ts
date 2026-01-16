import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTrailDto {
  @IsString()
  @IsOptional()
  name?: string;

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
