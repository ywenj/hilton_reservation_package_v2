import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { JwtService } from "@nestjs/jwt";
import { IntrospectResponseDto } from "../dto/introspect.dto";

@Injectable()
export class IntrospectionService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>
  ) {}

  async introspect(token: string): Promise<IntrospectResponseDto> {
    if (!token) return { active: false };
    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      if (!payload?.sub) return { active: false };
      const user = await this.userModel
        .findById(payload.sub, { email: 1, phone: 1, username: 1, role: 1 })
        .lean();
      if (!user) return { active: false };
      return {
        active: true,
        sub: payload.sub,
        role: user.role,
        username: user.username,
        exp: payload.exp,
        iat: payload.iat,
        email: user.email,
        phone: user.phone,
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
