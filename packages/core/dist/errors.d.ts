export declare class XixiError extends Error {
    readonly code: string;
    readonly hint?: string;
    readonly cause?: unknown;
    constructor(code: string, message: string, hint?: string, cause?: unknown);
}
export declare function toUserMessage(error: unknown, verbose?: boolean): string;
