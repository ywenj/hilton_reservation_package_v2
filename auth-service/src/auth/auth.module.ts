import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { IntrospectionService } from "./introspection.service";
import { User, UserSchema } from "./schemas/user.schema";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { BasicStrategy } from "./strategies/basic.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // Use numeric seconds for expiresIn; fallback to 3600
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN
          ? parseInt(process.env.JWT_EXPIRES_IN, 10)
          : 3600,
      },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [AuthService, JwtStrategy, BasicStrategy, IntrospectionService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
