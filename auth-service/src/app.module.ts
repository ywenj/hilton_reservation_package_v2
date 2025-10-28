import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    MongooseModule.forRoot(
      process.env.COSMOS_MONGO_URI ||
        "mongodb://root:root@localhost:27017/hilton_reservations?authSource=admin"
    ),
    JwtModule.register({
      secret: "dd9eddf2-01a3-468b-8f3e-18f427d898c5",
      // Use numeric seconds for expiresIn; fallback to 3600
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN
          ? parseInt(process.env.JWT_EXPIRES_IN, 10)
          : 3600,
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
