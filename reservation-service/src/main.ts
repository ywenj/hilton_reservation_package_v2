import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "reflect-metadata";
import * as dotenv from "dotenv";
import { LoggingInterceptor } from "./common/logging.interceptor";
import { AppLogger } from "./common/logging/app-logger";
import { GlobalGraphQLExceptionFilter } from "./common/graphql-exception.filter";
dotenv.config({ path: ".env" });

async function bootstrap() {
  const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim());
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      allowedHeaders: "Content-Type,Authorization",
      exposedHeaders: "Content-Length",
      maxAge: 3600,
    },
  });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalGraphQLExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(
    `Reservation Service listening on http://localhost:${port}/graphql`
  );
}

bootstrap();
