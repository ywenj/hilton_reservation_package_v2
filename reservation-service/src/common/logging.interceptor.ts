import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctxType = context.getType<"http" | "graphql" | "rpc" | "ws">();
    const started = Date.now();

    if (ctxType === "graphql") {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      const req = gqlCtx.getContext().req;
      const operationName = info.operation?.name?.value || "anonymous";
      const fieldName = info.fieldName;
      const variables = gqlCtx.getArgs();

      // Avoid logging sensitive fields (basic heuristic).
      const sanitizedVariables = JSON.parse(
        JSON.stringify(variables, (key, value) => {
          if (typeof key === "string" && /(password|secret|token)/i.test(key)) {
            return "***";
          }
          return value;
        })
      );

      console.log(
        `[GraphQL] -> Operation=${operationName} Field=${fieldName} Variables=${JSON.stringify(
          sanitizedVariables
        )}`
      );

      return next.handle().pipe(
        tap((response) => {
          const duration = Date.now() - started;
          // Trim large arrays/objects for log brevity.
          const sanitizedResponse = JSON.parse(
            JSON.stringify(response, (key, value) => {
              if (Array.isArray(value) && value.length > 20) {
                return `[Array(${value.length}) truncated]`;
              }
              if (typeof value === "string" && value.length > 500) {
                return value.slice(0, 500) + "...";
              }
              return value;
            })
          );
          console.log(
            `[GraphQL] <- Operation=${operationName} Field=${fieldName} Duration=${duration}ms Response=${JSON.stringify(
              sanitizedResponse
            )}`
          );
        })
      );
    }

    // Fallback for non-GraphQL contexts.
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - started;
        console.log(`[${ctxType.toUpperCase()}] Completed in ${duration}ms`);
      })
    );
  }
}
