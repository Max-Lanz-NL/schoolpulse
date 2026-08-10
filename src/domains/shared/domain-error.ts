export type DomainErrorCode =
  "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "VALIDATION" | "DATABASE";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export function toDomainError(
  error: unknown,
  fallback = "De gegevens konden niet worden verwerkt.",
) {
  if (error instanceof DomainError) return error;
  const candidate = error as { code?: string; message?: string } | null;
  const code = candidate?.code;
  if (code === "PGRST116")
    return new DomainError("NOT_FOUND", "Het gevraagde item bestaat niet.", error);
  if (code === "42501" || code === "PGRST301")
    return new DomainError("FORBIDDEN", "Je hebt geen toegang tot deze gegevens.", error);
  if (code === "23503")
    return new DomainError(
      "VALIDATION",
      "Dit onderdeel kan niet worden verwijderd omdat het nog door andere schoolgegevens wordt gebruikt.",
      error,
    );
  if (code === "23505")
    return new DomainError("VALIDATION", "Deze naam of code bestaat al binnen de school.", error);
  if (code === "23514")
    return new DomainError(
      "VALIDATION",
      "Een of meer waarden voldoen niet aan de toegestane grenzen of datums.",
      error,
    );
  console.error("SchoolPulse domain operation failed", error);
  return new DomainError("DATABASE", fallback, error);
}

export function readableDomainError(error: unknown) {
  return toDomainError(error).message;
}
