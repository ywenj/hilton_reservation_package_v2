import { IsString } from "class-validator";

export class IntrospectRequestDto {
  @IsString()
  token!: string;
}

export interface IntrospectResponseDto {
  active: boolean;
  sub?: string;
  role?: string;
  username?: string;
  exp?: number;
  iat?: number;
}
