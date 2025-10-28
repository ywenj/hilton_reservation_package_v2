import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { ReservationsModule } from "./reservations/reservations.module";

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
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    ReservationsModule,
  ],
})
export class AppModule {}
