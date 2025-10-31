import { IsString, MinLength } from "class-validator";

export class LoginEmployeeDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
