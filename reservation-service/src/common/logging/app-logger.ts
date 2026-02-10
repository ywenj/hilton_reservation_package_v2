import { ConsoleLogger, LogLevel } from "@nestjs/common";
import { randomUUID } from "crypto";

const order: LogLevel[] = ["error", "warn", "log", "debug", "verbose"];

export class AppLogger extends ConsoleLogger {
  private minLevel: LogLevel;
  private json: boolean;
  private serviceName: string;
  private contextData: Record<string, any> = {};

  constructor() {
    super();
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || "log";
    this.json = process.env.LOG_JSON === "true";
    this.serviceName = process.env.SERVICE_NAME || "reservation-service";
  }

  attachRequest(req: { headers?: any; user?: any }) {
    const rid = req.headers?.["x-request-id"] || randomUUID();
    this.contextData.requestId = rid;
    if (req.user?.sub) this.contextData.userId = req.user.sub;
    return rid;
  }

  setUser(user?: { sub?: string }) {
    if (user?.sub) this.contextData.userId = user.sub;
  }

  private allowed(level: LogLevel) {
    return order.indexOf(level) <= order.indexOf(this.minLevel);
  }

  private emit(level: LogLevel, message: any, meta?: any) {
    if (!this.allowed(level)) return;
    const base: any = {
      time: new Date().toISOString(),
      level,
      msg: message,
      service: this.serviceName,
      ...this.contextData,
      ...(meta ? { meta } : {}),
    };
    if (this.json) {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(base));
    } else {
      const parts = [
        `[${base.time}]`,
        `[${base.service}]`,
        `[${level.toUpperCase()}]`,
        base.requestId ? `[rid:${base.requestId}]` : "",
        base.userId ? `[uid:${base.userId}]` : "",
        String(base.msg),
      ].filter(Boolean);
      // eslint-disable-next-line no-console
      console.log(parts.join(" ") + (meta ? " " + JSON.stringify(meta) : ""));
    }
  }

  log(message: any, context?: string) {
    this.emit("log", message, context && { context });
  }
  error(message: any, stack?: string, context?: string) {
    this.emit("error", message, { stack, context });
  }
  warn(message: any, context?: string) {
    this.emit("warn", message, context && { context });
  }
  debug(message: any, context?: string) {
    this.emit("debug", message, context && { context });
  }
  verbose(message: any, context?: string) {
    this.emit("verbose", message, context && { context });
  }
}
