import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ReservationsModule } from "./reservations/reservations.module";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import * as dotenv from "dotenv";
import { IntrospectionClient } from "./common/auth/introspection.client";
import { AuthSupportModule } from "./common/auth/auth-support.module";
import { LoggingModule } from "./common/logging/logging.module";
import { AppLogger } from "./common/logging/app-logger";
dotenv.config({ path: ".env" });

// 通过 Nest 注入 IntrospectionClient，避免手动生命周期管理。
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.COSMOS_MONGO_URI ||
        "mongodb://localhost:27017/hilton_reservations"
    ),
    AuthSupportModule,
    LoggingModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthSupportModule],
      inject: [IntrospectionClient, AppLogger],
      useFactory: (
        introspectionClient: IntrospectionClient,
        appLogger: AppLogger
      ) => ({
        autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        plugins: [],
        validationRules: [require("graphql-depth-limit")(3)],
        formatError: (formattedError) => {
          const { message, extensions } = formattedError;
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
        context: async ({ req }: { req: any }) => {
          const auth = req.headers?.authorization || "";
          const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
          appLogger.attachRequest(req);
          if (!process.env.AUTH_INTROSPECTION_URL || !token) {
            return { req, user: null };
          }
          try {
            const r = await introspectionClient.introspect(token);
            if (r.active) {
              appLogger.setUser({ sub: r.sub });
              return {
                req,
                user: {
                  sub: r.sub,
                  role: r.role,
                  name: r.username,
                  email: r.email,
                  phone: r.phone,
                },
              };
            }
          } catch {
            // ignore
          }
          return { req, user: null };
        },
      }),
    }),
    ReservationsModule,
  ],
  providers: [],
})
export class AppModule {}
