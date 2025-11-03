import { IsOptional, IsEmail, IsString, Matches } from "class-validator";

export class LoginGuestDto {
  @IsOptional()
  //   @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9\-+]{6,20}$/)
  phone?: string;
}
