import { Schema as S } from "effect";

/**
 * Representation of a session.
 */
export const session = S.Struct({
    /**
     * Whether resuming is enabled or not.
     */
    resuming: S.Boolean,

    /**
     * The amount of seconds you are allowed to resume.
     */
    timeout: S.Number,
});

/**
 * Request used to update a session.
 */
export const sessionUpdate = S.partial(session);
