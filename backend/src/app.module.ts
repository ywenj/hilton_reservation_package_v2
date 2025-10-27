import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { join } from "path";
import { AuthModule } from "./auth/auth.module";
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
      // ApolloServer v4 playground replacement
      plugins:
        process.env.GRAPHQL_PLAYGROUND === "true"
          ? [ApolloServerPluginLandingPageLocalDefault()]
          : [],
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    ReservationsModule,
  ],
})
export class AppModule {}
