// Error handling utilities and custom error classes
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(field ? `${field}: ${message}` : message, "VALIDATION_ERROR", 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      "NOT_FOUND",
      404
    );
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError?: any) {
    super(`Database operation failed: ${message}`, "DATABASE_ERROR", 500);

    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// Result pattern for better error handling
export type Result<T, E = AppError> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: E;
    };

// Helper functions to create Results
export const success = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const failure = <E extends AppError>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Async Result wrapper
export const asyncResult = async <T>(
  asyncFn: () => Promise<T>
): Promise<Result<T>> => {
  try {
    const data = await asyncFn();
    return success(data);
  } catch (error) {
    if (error instanceof AppError) {
      return failure(error);
    }

    // Convert unknown errors to AppError
    return failure(
      new DatabaseError(
        error instanceof Error ? error.message : "Unknown error occurred"
      )
    );
  }
};