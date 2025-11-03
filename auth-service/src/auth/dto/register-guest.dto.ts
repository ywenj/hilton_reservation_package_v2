import {
  IsOptional,
  IsString,
  MinLength,
  IsEmail,
  Matches,
} from "class-validator";

export class RegisterGuestDto {
  // guest 用户名必填
  @IsString()
  @MinLength(3)
  username!: string;

  // 仍可选
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  // 至少 email 或 phone 其一提供, 在控制器中进行自定义校验
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9\-+]{6,20}$/)
  phone?: string;
}
