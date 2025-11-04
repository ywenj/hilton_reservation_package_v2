import { Injectable, Logger } from "@nestjs/common";
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

  private readonly logger = new Logger(IntrospectionService.name);

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
      this.logger.debug(
        `Introspect success sub=${payload.sub} role=${user.role}`
      );
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
      this.logger.warn(
        `Introspect failed: ${(e as Error)?.name} ${(e as Error)?.message}`
      );
      return { active: false };
    }
  }
}
