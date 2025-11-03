import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GraphQLModule } from "@nestjs/graphql";
import { ReservationsModule } from "./reservations/reservations.module";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import * as dotenv from "dotenv";
import { IntrospectionClient } from "./common/auth/introspection.client";
dotenv.config({ path: ".env" });

// 通过 Nest 注入 IntrospectionClient，避免手动生命周期管理。
@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.COSMOS_MONGO_URI ||
        "mongodb://localhost:27017/hilton_reservations"
    ),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [],
      inject: [IntrospectionClient],
      useFactory: (introspectionClient: IntrospectionClient) => ({
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
          if (!process.env.AUTH_INTROSPECTION_URL || !token) {
            return { req, user: null };
          }
          try {
            const r = await introspectionClient.introspect(token);
            if (r.active) {
              return {
                req,
                user: { sub: r.sub, role: r.role, username: r.username },
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
  providers: [
    {
      provide: IntrospectionClient,
      useFactory: () =>
        process.env.AUTH_INTROSPECTION_URL
          ? new IntrospectionClient(
              process.env.AUTH_INTROSPECTION_URL,
              Number(process.env.INTROSPECTION_CACHE_TTL_MS) || 30000
            )
          : new IntrospectionClient("", 1), // 空 URL 时返回 inactive 结果
    },
  ],
})
export class AppModule {}
