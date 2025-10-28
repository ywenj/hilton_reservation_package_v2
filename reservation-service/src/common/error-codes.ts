export enum AppErrorCode {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
}

export interface NormalizedErrorShape {
  code: AppErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}
