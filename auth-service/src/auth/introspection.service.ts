import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IntrospectResponseDto } from "./dto/introspect.dto";

@Injectable()
export class IntrospectionService {
  constructor(private readonly jwtService: JwtService) {}

  introspect(token: string): IntrospectResponseDto {
    if (!token) return { active: false };
    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      return {
        active: true,
        sub: payload.sub,
        role: payload.role,
        username: payload.username,
        exp: payload.exp,
        iat: payload.iat,
      };
    } catch (e) {
      console.error("[IntrospectionService] Token verification failed:", {
        errorName: (e as Error)?.name,
        errorMessage: (e as Error)?.message,
      });
      return { active: false };
    }
  }
}
