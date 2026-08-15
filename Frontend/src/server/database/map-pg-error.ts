import { AppError } from "@/lib/app-error";
import { ERROR_CODES } from "@/types/api";

type PgLikeError = {
  code?: string | undefined;
};

export function mapPgError(error: unknown): never {
  const code = typeof error === "object" && error && "code" in error ? String((error as PgLikeError).code ?? "") : "";
  if (code === "23505") {
    throw AppError.conflict("Resource already exists");
  }
  if (code === "23503") {
    throw new AppError("Related record is invalid", 422, ERROR_CODES.UNPROCESSABLE);
  }
  if (code === "23514" || code === "23502") {
    throw AppError.validation([{ field: "body", message: "Constraint failed" }]);
  }
  throw error;
}
