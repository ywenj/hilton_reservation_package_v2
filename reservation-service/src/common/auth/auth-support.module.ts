import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { IntrospectionClient } from "./introspection.client";
import * as dotenv from "dotenv";

// 提前加载 .env，避免在模块装饰器阶段 process.env 还未填充（特别是调试 / Jest 环境）
// VSCode 调试若从 monorepo 根目录启动，可显式指定路径。
dotenv.config({ path: ".env" });

@Module({
  imports: [
    CacheModule.register({
      // 默认 TTL 秒：与 IntrospectionClient 内部 ttlMs 保持一致（30s）。可通过环境变量覆盖。
      ttl: Math.ceil(
        (Number(process.env.INTROSPECTION_CACHE_TTL_MS) || 30000) / 1000
      ),
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: IntrospectionClient,
      useFactory: (cache: any) => {
        const client = new IntrospectionClient(cache);
        client.url = process.env.AUTH_INTROSPECTION_URL || "";
        client.ttlMs = Number(process.env.INTROSPECTION_CACHE_TTL_MS) || 30000;
        client.fetchImpl = fetch;
        return client;
      },
      inject: ["CACHE_MANAGER"],
    },
  ],
  exports: [IntrospectionClient],
})
export class AuthSupportModule {}
