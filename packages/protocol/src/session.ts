import * as S from "@effect/schema/Schema";

/**
 * Representation of a session.
 */
export const session = S.struct({
    /**
     * Whether resuming is enabled or not.
     */
    resuming: S.boolean,

    /**
     * The amount of seconds you are allowed to resume.
     */
    timeout: S.number,
});

/**
 * Request used to update a session.
 */
export const sessionUpdate = S.partial(session);
