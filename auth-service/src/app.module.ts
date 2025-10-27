import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.COSMOS_MONGO_URI ||
        "mongodb://root:root@localhost:27017/hilton_reservations?authSource=admin"
    ),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "replace_this_with_strong_secret",
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
