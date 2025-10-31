import { IsString, MinLength, IsIn } from "class-validator";

export class RegisterEmployeeDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsIn(["employee"])
  role: string = "employee";
}
