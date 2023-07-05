import * as S from "@effect/schema/Schema";
import * as C from "./common.js";

export const ready = S.struct({
    resumed: S.boolean,
    sessionId: S.string,
});

export const playerUpdate = S.struct({
    guildId: S.string,
    state: C.playerState,
});

export const eventType = S.union(
    S.literal("TrackStartEvent"),
    S.literal("TrackEndEvent"),
    S.literal("TrackExceptionEvent"),
    S.literal("TrackStuckEvent"),
    S.literal("WebSocketClosedEvent"),
);

export const trackStartEvent = S.struct({
    type: S.literal("TrackStartEvent"),
    guildId: S.string,
    //
    track: C.track,
});

export const trackEndReason = S.union(
    S.literal("finished"),
    S.literal("loadFailed"),
    S.literal("stopped"),
    S.literal("replaced"),
    S.literal("cleanup"),
);

export const trackEndEvent = S.struct({
    type: S.literal("TrackEndEvent"),
    guildId: S.string,
    //
    track: C.track,
    reason: trackEndReason,
});

export const trackExceptionEvent = S.struct({
    type: S.literal("TrackExceptionEvent"),
    guildId: S.string,
    //
    track: C.track,
    exception: C.exception,
});

export const trackStuckEvent = S.struct({
    type: S.literal("TrackStuckEvent"),
    guildId: S.string,
    //
    track: C.track,
    thresholdMs: S.number,
});

export const webSocketClosedEvent = S.struct({
    type: S.literal("WebSocketClosedEvent"),
    guildId: S.string,
    //
    code: S.number,
    reason: S.string,
    byRemote: S.boolean,
});

export const event = S.union(
    trackStartEvent,
    trackEndEvent,
    trackExceptionEvent,
    trackStuckEvent,
    webSocketClosedEvent,
);

export const message = S.union(
    S.extend(C.stats, S.struct({ op: S.literal("stats") })),
    S.extend(playerUpdate, S.struct({ op: S.literal("playerUpdate") })),
    S.extend(ready, S.struct({ op: S.literal("ready") })),
    S.extend(event, S.struct({ op: S.literal("event") })),
);

export type Ready = S.To<typeof ready>;

export type PlayerUpdate = S.To<typeof playerUpdate>;

export type Event = S.To<typeof event>;

export type Message = S.To<typeof message>;

export type TrackStartEvent = S.To<typeof trackStartEvent>;

export type TrackEndReason = S.To<typeof trackEndReason>;

export type TrackEndEvent = S.To<typeof trackEndEvent>;

export type TrackExceptionEvent = S.To<typeof trackExceptionEvent>;

export type TrackStuckEvent = S.To<typeof trackStuckEvent>;

export type WebSocketClosedEvent = S.To<typeof webSocketClosedEvent>;
