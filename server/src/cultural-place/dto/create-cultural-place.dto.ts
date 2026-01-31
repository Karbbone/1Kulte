import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CulturalPlaceType } from '../cultural-place-type.enum';

export class CreateCulturalPlaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  postCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsEnum(CulturalPlaceType, {
    message: 'Le type doit être art, patrimoine, mythe ou musique',
  })
  @IsNotEmpty()
  type: CulturalPlaceType;
}
