export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, retryable = false, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryable = retryable;
    this.details = details;
  }
}

export function apiErrorFromResponse(status: number, payload: unknown): ApiError {
  const value = payload as { error?: Record<string, unknown> } | null;
  const error = value?.error;
  const fallback: Record<number, string> = {
    401: "UNAUTHENTICATED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "INVALID_INPUT",
    503: "TEMPORARILY_UNAVAILABLE",
  };
  return new ApiError(
    status,
    typeof error?.code === "string" ? error.code : (fallback[status] ?? "HTTP_ERROR"),
    typeof error?.message === "string" ? error.message : "The server could not complete this request.",
    error?.retryable === true || status >= 500,
    error?.details,
  );
}

export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Try again.";
  if (error.status === 0) return "The server could not be reached. Check your connection and try again.";
  if (error.code === "INVALID_CREDENTIALS") return "Email or password is incorrect.";
  if (error.status === 401) return "Your session has ended. Log in to continue.";
  if (error.status === 403) return "You don’t have access to this action.";
  if (error.status === 404) return "This record could not be found.";
  if (error.status >= 500) return "The service is temporarily unavailable. Try again.";
  if (error.code === "HOLD_EXPIRED") return "This hold has expired. Find another available vehicle.";
  if (error.code === "VEHICLE_UNAVAILABLE") return "This vehicle is no longer available. Check the latest availability.";
  if (error.code === "INVALID_TRANSITION") return "This action isn’t available in the current state. Check the latest status.";
  return error.message;
}
