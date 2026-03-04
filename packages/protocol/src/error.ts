import { Schema as S } from "effect" ;

/**
 * Representation of a REST error.
 */
export const error = S.Struct({
    timestamp: S.Number,
    status: S.Number,
    error: S.String,
    trace: S.optional(S.String),
    message: S.String,
    path: S.String,
});

export type Error = S.Schema.Type<typeof error>;
