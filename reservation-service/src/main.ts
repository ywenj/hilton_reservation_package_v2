import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import "reflect-metadata";
import * as dotenv from "dotenv";
import { LoggingInterceptor } from "./common/logging.interceptor";
import { GlobalGraphQLExceptionFilter } from "./common/graphql-exception.filter";
dotenv.config({ path: ".env" });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalGraphQLExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `Reservation Service listening on http://localhost:${port}/graphql`
  );
}

bootstrap();
