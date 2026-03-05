"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XixiError = void 0;
exports.toUserMessage = toUserMessage;
class XixiError extends Error {
    constructor(code, message, hint, cause) {
        super(message);
        this.name = "XixiError";
        this.code = code;
        this.hint = hint;
        this.cause = cause;
    }
}
exports.XixiError = XixiError;
function toUserMessage(error, verbose = false) {
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
//# sourceMappingURL=errors.js.map