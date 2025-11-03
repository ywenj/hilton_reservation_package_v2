import { Module } from "@nestjs/common";
import { IntrospectionClient } from "./introspection.client";

@Module({
  providers: [
    {
      provide: IntrospectionClient,
      useFactory: () =>
        process.env.AUTH_INTROSPECTION_URL
          ? new IntrospectionClient(
              process.env.AUTH_INTROSPECTION_URL!,
              Number(process.env.INTROSPECTION_CACHE_TTL_MS) || 30000
            )
          : new IntrospectionClient("", 1),
    },
  ],
  exports: [IntrospectionClient],
})
export class AuthSupportModule {}
