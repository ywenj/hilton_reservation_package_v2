import { Module, MiddlewareConsumer } from "@nestjs/common";
import { AppLogger } from "./app-logger";
import { RequestContextMiddleware } from "./request-context.middleware";

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
