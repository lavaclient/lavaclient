import "tslib";

export * from "./api.js";
export * from "./error.js";
export * from "./filters.js";
export * from "./info.js";
export * from "./loadResult.js";
export * from "./messages.js";
export * from "./player.js";
export * from "./routeplanner.js";
export * from "./session.js";
export * from "./stats.js";

import * as TF from "@effect/schema/TreeFormatter";
import * as PR from "@effect/schema/ParseResult";
import * as S from "@effect/schema/Schema";

export type { Schema } from "@effect/schema/Schema";

export type AnySchema<T = any> = S.Schema<any, T>;

/**
 * Encode a value with the given schema.
 * 
 * @param schema  The schema to encode with.
 * @param value   The value to encode.
 * @param message The message to throw if the value fails to encode.
 */
export const encode = <I, A>(schema: S.Schema<I, A>, value: A, message = "Failed to encode value"): I => {
    const result = S.encodeEither(schema)(value);
    if (result._tag === "Left") {
        throw new SchemaError(message, result.left);
    }

    return result.right;
}

/**
 * Parse a value with the given schema.
 * 
 * @param schema  The schema to parse with.
 * @param data    The data to parse.
 * @param message The message to throw if the data fails to parse.
 */
export const parse = <T>(
    schema: AnySchema<T>,
    data: unknown,
    message: string = "Failed to parse value",
): T => {
    const result = S.parseEither(schema)(data);
    if (result._tag === "Left") {
        throw new SchemaError(message, result.left);
    }

    return result.right;
}

export class SchemaError extends TypeError {
    constructor(message: string, readonly inner: PR.ParseError) {
        super(message, { cause: TF.formatErrors(inner.errors) });
    }
}
