import * as S from "@effect/schema/Schema";

/**
 * Representation of a REST error.
 */
export const error = S.struct({
    timestamp: S.number,
    status: S.number,
    error: S.string,
    trace: S.optional(S.string),
    message: S.string,
    path: S.string,
});

export type Error = S.To<typeof error>;
