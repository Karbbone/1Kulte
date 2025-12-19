import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginUserDto {
  @MaxLength(100)
  @IsEmail()
  email: string;

  @MaxLength(100)
  @IsString()
  password: string;
}
