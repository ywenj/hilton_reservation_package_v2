import {
  ArgumentsHost,
  HttpException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { GqlArgumentsHost } from "@nestjs/graphql";
import { GlobalGraphQLExceptionFilter } from "../src/common/graphql-exception.filter";
import { AppErrorCode } from "../src/common/error-codes";

/** Shape of the enriched Error thrown by the filter */
interface FilterError extends Error {
  extensions: {
    code: AppErrorCode;
    status: number;
    details?: Record<string, unknown>;
    timestamp: string;
    path?: string;
  };
}

/** Mongoose-style validation error */
interface MongooseValidationError {
  name: "ValidationError";
  message: string;
  errors: Record<string, { message: string }>;
}

// Mock GqlArgumentsHost
jest.mock("@nestjs/graphql", () => ({
  GqlArgumentsHost: {
    create: jest.fn(),
  },
}));

const mockGqlArgumentsHost = GqlArgumentsHost.create as jest.MockedFunction<
  typeof GqlArgumentsHost.create
>;

describe("GlobalGraphQLExceptionFilter", () => {
  let filter: GlobalGraphQLExceptionFilter;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalGraphQLExceptionFilter();

    mockHost = {} as ArgumentsHost;
    mockGqlArgumentsHost.mockReturnValue({
      getContext: () => ({}),
      getInfo: () => ({ fieldName: "testField" }),
    } as unknown as ReturnType<typeof GqlArgumentsHost.create>);

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---- Helper ----
  function catchError(exception: unknown): FilterError {
    try {
      filter.catch(exception, mockHost);
      throw new Error("Expected filter to throw");
    } catch (err: unknown) {
      return err as FilterError;
    }
  }

  // ---- HttpException: NotFoundException (404) ----
  it("should map NotFoundException to NOT_FOUND", () => {
    const err = catchError(new NotFoundException("Reservation not found"));

    expect(err.message).toBe("Reservation not found");
    expect(err.extensions.code).toBe(AppErrorCode.NOT_FOUND);
    expect(err.extensions.status).toBe(404);
    expect(err.extensions.path).toBe("testField");
    expect(err.extensions.timestamp).toBeDefined();
  });

  // ---- HttpException: BadRequestException (400) ----
  it("should map BadRequestException to BAD_REQUEST", () => {
    const err = catchError(new BadRequestException("Invalid input"));

    expect(err.message).toBe("Invalid input");
    expect(err.extensions.code).toBe(AppErrorCode.BAD_REQUEST);
    expect(err.extensions.status).toBe(400);
  });

  // ---- HttpException: ConflictException (409) ----
  it("should map ConflictException to CONFLICT", () => {
    const err = catchError(new ConflictException("Version conflict"));

    expect(err.message).toBe("Version conflict");
    expect(err.extensions.code).toBe(AppErrorCode.CONFLICT);
    expect(err.extensions.status).toBe(409);
  });

  // ---- HttpException with string response ----
  it("should handle HttpException with string response", () => {
    const err = catchError(new HttpException("Forbidden", 403));

    expect(err.message).toBe("Forbidden");
    expect(err.extensions.code).toBe(AppErrorCode.INTERNAL_ERROR);
    expect(err.extensions.status).toBe(403);
  });

  // ---- HttpException with array message (validation) ----
  it("should join array messages from HttpException response", () => {
    const exception = new BadRequestException({
      message: ["field1 is required", "field2 must be a number"],
      error: "Bad Request",
    });

    const err = catchError(exception);

    expect(err.message).toBe("field1 is required; field2 must be a number");
    expect(err.extensions.code).toBe(AppErrorCode.BAD_REQUEST);
    expect(err.extensions.status).toBe(400);
    expect(err.extensions.details).toBeDefined();
  });

  // ---- ValidationError (e.g. Mongoose) ----
  it("should map ValidationError to VALIDATION_FAILED", () => {
    const exception: MongooseValidationError = {
      name: "ValidationError",
      message: "Validation failed",
      errors: { tableSize: { message: "must be >= 1" } },
    };

    const err = catchError(exception);

    expect(err.message).toBe("Validation failed");
    expect(err.extensions.code).toBe(AppErrorCode.VALIDATION_FAILED);
    expect(err.extensions.status).toBe(500);
    expect(err.extensions.details).toEqual({
      tableSize: { message: "must be >= 1" },
    });
  });

  // ---- Generic error with message ----
  it("should handle generic error with message", () => {
    const err = catchError(new Error("Something broke"));

    expect(err.message).toBe("Something broke");
    expect(err.extensions.code).toBe(AppErrorCode.INTERNAL_ERROR);
    expect(err.extensions.status).toBe(500);
  });

  // ---- Unknown error without message ----
  it("should fallback to default message for unknown errors", () => {
    const err = catchError({});

    expect(err.message).toBe("Internal server error");
    expect(err.extensions.code).toBe(AppErrorCode.INTERNAL_ERROR);
    expect(err.extensions.status).toBe(500);
  });

  // ---- null/undefined exception ----
  it("should handle null exception gracefully", () => {
    const err = catchError(null);

    expect(err.message).toBe("Internal server error");
    expect(err.extensions.code).toBe(AppErrorCode.INTERNAL_ERROR);
  });

  // ---- fieldName is undefined (no GQL info) ----
  it("should handle missing fieldName (info is undefined)", () => {
    mockGqlArgumentsHost.mockReturnValue({
      getContext: () => ({}),
      getInfo: () => undefined,
    } as unknown as ReturnType<typeof GqlArgumentsHost.create>);

    const err = catchError(new Error("No info"));

    expect(err.message).toBe("No info");
    expect(err.extensions.path).toBeUndefined();
  });

  // ---- console.error is called ----
  it("should log error via console.error", () => {
    catchError(new Error("log test"));

    expect(console.error).toHaveBeenCalledWith(
      "[GraphQL Error]",
      expect.stringContaining("log test"),
    );
  });
});
