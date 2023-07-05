import * as S from "@effect/schema/Schema.js";
import * as C from "./common";

//
export const updatePlayerRequest = S.partial(
    S.extend(
        S.union(S.struct({ encodedTrack: S.nullable(S.string) }), S.struct({ identifier: S.string })),
        S.struct({
            position: S.number,
            endTime: S.number,
            volume: S.number,
            paused: S.boolean,
            filters: C.filters,
            voice: C.voice,
        }),
    ),
);

export type UpdatePlayerRequest = S.To<typeof updatePlayerRequest>;

//
export const updateSessionRequest = S.struct({
    resuming: S.optional(S.boolean),
    timeout: S.optional(S.number),
});

export type UpdateSessionRequest = S.To<typeof updateSessionRequest>;

//
