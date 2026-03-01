import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from "@nestjs/common";
import { GqlArgumentsHost } from "@nestjs/graphql";
import { AppErrorCode, NormalizedErrorShape } from "./error-codes";

/** Error with Apollo-compatible extensions for GraphQL error responses */
interface GraphQLFormattedError extends Error {
  extensions: {
    code: AppErrorCode;
    status: number;
    details?: unknown;
    timestamp: string;
    path?: string;
  };
}

@Catch()
@Injectable()
export class GlobalGraphQLExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const info = gqlHost.getInfo();

    const path = info?.fieldName;
    const timestamp = new Date().toISOString();

    let status: number = 500;
    let message = "Internal server error";
    let code: AppErrorCode = AppErrorCode.INTERNAL_ERROR;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response: any = exception.getResponse();
      if (typeof response === "string") {
        message = response;
      } else if (response?.message) {
        message = Array.isArray(response.message)
          ? response.message.join("; ")
          : response.message;
        details = response;
      }
      if (status === 404) code = AppErrorCode.NOT_FOUND;
      else if (status === 409) code = AppErrorCode.CONFLICT;
      else if (status === 400) code = AppErrorCode.BAD_REQUEST;
    } else if (exception?.name === "ValidationError") {
      code = AppErrorCode.VALIDATION_FAILED;
      message = exception.message;
      details = exception.errors;
    } else if (exception?.message) {
      message = exception.message;
    }

    const normalized: NormalizedErrorShape = {
      code,
      message,
      details,
      timestamp,
      path,
    };

    // Log error (could integrate with winston later)
    console.error("[GraphQL Error]", JSON.stringify({ status, ...normalized }));

    // For GraphQL, we throw a new error to let Apollo format it. We attach extensions.
    const errorWithExtensions = new Error(message) as GraphQLFormattedError;
    errorWithExtensions.extensions = {
      code,
      status,
      details,
      timestamp,
      path,
    };
    throw errorWithExtensions;
  }
}
