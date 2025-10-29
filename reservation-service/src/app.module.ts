import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { ReservationsModule } from "./reservations/reservations.module";
import * as jwt from "jsonwebtoken";

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.COSMOS_MONGO_URI ||
        "mongodb://localhost:27017/hilton_reservations"
    ),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      // Landing page plugin removed to avoid duplicate renderLandingPage error with implicit default.
      plugins: [],
      validationRules: [require("graphql-depth-limit")(3)],
      formatError: (formattedError) => {
        const { message, extensions } = formattedError;
        // Remove stack traces / locations.
        return {
          message,
          extensions: {
            code: extensions?.code,
            status: extensions?.status,
            details: extensions?.details,
            timestamp: extensions?.timestamp,
            path: extensions?.path,
          },
        };
      },
      context: ({ req }: { req: any }) => {
        const auth = req.headers?.authorization || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        let user: any = null;
        if (token) {
          try {
            user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
          } catch (e) {
            // ignore invalid token at context level; guard will enforce when needed
          }
        }
        return { req, user };
      },
    }),
    ReservationsModule,
  ],
})
export class AppModule {}
