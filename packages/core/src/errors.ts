export class XixiError extends Error {
  readonly code: string;
  readonly hint?: string;
  readonly cause?: unknown;

  constructor(code: string, message: string, hint?: string, cause?: unknown) {
    super(message);
    this.name = "XixiError";
    this.code = code;
    this.hint = hint;
    this.cause = cause;
  }
}

export function toUserMessage(error: unknown, verbose = false): string {
  if (error instanceof XixiError) {
    const lines = [`[${error.code}] ${error.message}`];
    if (error.hint) {
      lines.push(`Hint: ${error.hint}`);
    }
    if (verbose && error.stack) {
      lines.push("");
      lines.push(error.stack);
    }
    return lines.join("\n");
  }

  if (error instanceof Error) {
    if (verbose && error.stack) {
      return error.stack;
    }
    return error.message;
  }

  return String(error);
}

