import { Injectable, NestMiddleware } from "@nestjs/common";
import { AppLogger } from "./app-logger";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLogger) {}
  use(req: any, res: any, next: () => void) {
    const rid = this.logger.attachRequest(req);
    res.setHeader("x-request-id", rid);
    next();
  }
}
