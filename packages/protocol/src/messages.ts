import * as AST from "@effect/schema/AST";
import * as S from "@effect/schema/Schema";

import { track, playerState } from "./player.js";
import { exception } from "./loadResult.js";
import { stats } from "./stats.js";

const tag = <K extends string, V extends AST.LiteralValue>(k: K, v: V) =>
    S.extend(S.record(S.literal(k), S.literal(v)));

/**
 * The type of event that was dispatched.
 *
 * - `TrackStartEvent`
 *   Dispatched when a track starts playing.
 *
 * - `TrackEndEvent`
 *   Dispatched when a track ends.
 *
 * - `TrackExceptionEvent`
 *   Dispatched when a track throws an exception.
 *
 * - `TrackStuckEvent`
 *   Dispatched when a track gets stuck while playing.
 *
 * - `WebSocketClosedEvent`
 *   Dispatched when a websocket connection to Discord voice servers is closed.
 */
export const eventType = S.literal(
    "TrackStartEvent",
    "TrackEndEvent",
    "TrackExceptionEvent",
    "TrackStuckEvent",
    "WebSocketClosedEvent",
);

export const trackStartEvent = S.struct({
    /**
     * The guild id.
     */
    guildId: S.string,
    /**
     * The track that started playing.
     */
    track,
});

/**
 * Reason why a track stopped playing.
 *
 * - `finished`
 *   This means that the track itself emitted a terminator. This is usually caused by the track reaching the end,
 *   however it will also be used when it ends due to an exception.
 *
 * - `loadFailed`
 *   This means that the track failed to start, throwing an exception before providing any audio.
 *
 * - `stopped`
 *   The track was stopped due to the player being stopped by either calling stop() or playTrack(null)
 *
 * - `replaced`
 *   The track stopped playing because a new track started playing. Note that with this reason, the old track will still
 *   play until either its buffer runs out or audio from the new track is available.
 *
 * - `cleanup`
 *   The track was stopped because the cleanup threshold for the audio player was reached. This triggers when the amount
 *   of time passed since the last call to AudioPlayer#provide() has reached the threshold specified in player manager
 *   configuration. This may also indicate either a leaked audio player which was discarded, but not stopped.
 */
export const trackEndReason = S.literal("finished", "loadFailed", "stopped", "replaced", "cleanup");

export const trackEndEvent = S.struct({
    /**
     * The guild id.
     */
    guildId: S.string,
    /**
     * The track that ended.
     */
    track: track,
    /**
     * The reason the track ended.
     */
    reason: trackEndReason,
});

export const trackExceptionEvent = S.struct({
    /**
     * The guild id.
     */
    guildId: S.string,
    /**
     * The track that threw the exception.
     */
    track: track,
    /**
     * The exception that occurred.
     */
    exception: exception,
});

export const trackStuckEvent = S.struct({
    /**
     * The guild id.
     */
    guildId: S.string,
    /**
     * The track that got stuck.
     */
    track: track,
    /**
     * The threshold that was exceeded (in milliseconds).
     */
    thresholdMs: S.number,
});

export const webSocketClosedEvent = S.struct({
    /**
     * The guild id.
     */
    guildId: S.string,
    /**
     * The Discord close event code.
     */
    code: S.number,
    /**
     * The reason the socket was closed.
     */
    reason: S.string,
    /**
     * Whether the connection was closed by Discord.
     */
    byRemote: S.boolean,
});

export const event = S.union(
    tag("type", "TrackStartEvent")(trackStartEvent),
    tag("type", "TrackEndEvent")(trackEndEvent),
    tag("type", "TrackExceptionEvent")(trackExceptionEvent),
    tag("type", "TrackStuckEvent")(trackStuckEvent),
    tag("type", "WebSocketClosedEvent")(webSocketClosedEvent),
);

export const ready = S.struct({
    /**
     * Whether this session was resumed.
     */
    resumed: S.boolean,
    /**
     * The Lavalink session id of this connection. Not to be confused with a Discord voice session id.
     */
    sessionId: S.string,
});

export const playerUpdate = S.struct({
    /**
     * The guild id of the player.
     */
    guildId: S.string,
    /**
     * The player state.
     */
    state: playerState,
});

export const message = S.union(
    tag("op", "stats")(stats),
    tag("op", "event")(event),
    tag("op", "ready")(ready),
    tag("op", "playerUpdate")(playerUpdate),
);

/**
 * A basic lavalink message.
 */
export const basicMessage = S.struct({
    op: S.string,
});

export type BasicMessage = S.Schema.To<typeof basicMessage>;

export type Ready = S.Schema.To<typeof ready>;

export type PlayerUpdate = S.Schema.To<typeof playerUpdate>;

export type Event = S.Schema.To<typeof event>;

export type Message = S.Schema.To<typeof message>;

export type TrackStartEvent = S.Schema.To<typeof trackStartEvent>;

export type TrackEndReason = S.Schema.To<typeof trackEndReason>;

export type TrackEndEvent = S.Schema.To<typeof trackEndEvent>;

export type TrackExceptionEvent = S.Schema.To<typeof trackExceptionEvent>;

export type TrackStuckEvent = S.Schema.To<typeof trackStuckEvent>;

export type WebSocketClosedEvent = S.Schema.To<typeof webSocketClosedEvent>;
