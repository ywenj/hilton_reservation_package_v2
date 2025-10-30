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
    AuthModule,
  ],
})
export class AppModule {}
