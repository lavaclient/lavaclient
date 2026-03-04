import * as AST from "@effect/schema/AST";
import * as S from "@effect/schema/Schema";

import { track, playerState } from "./player.js";
import { exception } from "./loadResult.js";
import { stats } from "./stats.js";

const tag = <K extends string, V extends AST.LiteralValue>(k: K, v: V) =>
    S.extend(S.Record(S.Literal(k), S.Literal(v)));

/**
 * A map that can help determine whether you should start a new track when a {@link TrackEndEvent} is received.
 *
 * See [lavaplayer/AudioTrackEndReason.java](https://github.com/lavalink-devs/lavaplayer/blob/main/main/src/main/java/com/sedmelluq/discord/lavaplayer/track/AudioTrackEndReason.java )
 */
export const mayStartNext: Record<TrackEndReason, boolean> = {
    cleanup: false,
    finished: true,
    loadFailed: true,
    replaced: false,
    stopped: false,
};

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
export const eventType = S.Literal(
    "TrackStartEvent",
    "TrackEndEvent",
    "TrackExceptionEvent",
    "TrackStuckEvent",
    "WebSocketClosedEvent",
);

export const trackStartEvent = S.Struct({
    /**
     * The guild id.
     */
    guildId: S.String,
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
export const trackEndReason = S.Literal("finished", "loadFailed", "stopped", "replaced", "cleanup");

export const trackEndEvent = S.Struct({
    /**
     * The guild id.
     */
    guildId: S.String,
    /**
     * The track that ended.
     */
    track: track,
    /**
     * The reason the track ended.
     */
    reason: trackEndReason,
});

export const trackExceptionEvent = S.Struct({
    /**
     * The guild id.
     */
    guildId: S.String,
    /**
     * The track that threw the exception.
     */
    track: track,
    /**
     * The exception that occurred.
     */
    exception: exception,
});

export const trackStuckEvent = S.Struct({
    /**
     * The guild id.
     */
    guildId: S.String,
    /**
     * The track that got stuck.
     */
    track: track,
    /**
     * The threshold that was exceeded (in milliseconds).
     */
    thresholdMs: S.Number,
});

export const webSocketClosedEvent = S.Struct({
    /**
     * The guild id.
     */
    guildId: S.String,
    /**
     * The Discord close event code.
     */
    code: S.Number,
    /**
     * The reason the socket was closed.
     */
    reason: S.String,
    /**
     * Whether the connection was closed by Discord.
     */
    byRemote: S.Boolean,
});

export const event = S.Union(
    tag("type", "TrackStartEvent")(trackStartEvent),
    tag("type", "TrackEndEvent")(trackEndEvent),
    tag("type", "TrackExceptionEvent")(trackExceptionEvent),
    tag("type", "TrackStuckEvent")(trackStuckEvent),
    tag("type", "WebSocketClosedEvent")(webSocketClosedEvent),
);

export const ready = S.Struct({
    /**
     * Whether this session was resumed.
     */
    resumed: S.Boolean,
    /**
     * The Lavalink session id of this connection. Not to be confused with a Discord voice session id.
     */
    sessionId: S.String,
});

export const playerUpdate = S.Struct({
    /**
     * The guild id of the player.
     */
    guildId: S.String,
    /**
     * The player state.
     */
    state: playerState,
});

export const message = S.Union(
    tag("op", "stats")(stats),
    tag("op", "event")(event),
    tag("op", "ready")(ready),
    tag("op", "playerUpdate")(playerUpdate),
);

/**
 * A basic lavalink message.
 */
export const basicMessage = S.Struct({
    op: S.String,
});

export type BasicMessage = S.Schema.Type<typeof basicMessage>;

export type Ready = S.Schema.Type<typeof ready>;

export type PlayerUpdate = S.Schema.Type<typeof playerUpdate>;

export type Event = S.Schema.Type<typeof event>;

export type Message = S.Schema.Type<typeof message>;

export type TrackStartEvent = S.Schema.Type<typeof trackStartEvent>;

export type TrackEndReason = S.Schema.Type<typeof trackEndReason>;

export type TrackEndEvent = S.Schema.Type<typeof trackEndEvent>;

export type TrackExceptionEvent = S.Schema.Type<typeof trackExceptionEvent>;

export type TrackStuckEvent = S.Schema.Type<typeof trackStuckEvent>;

export type WebSocketClosedEvent = S.Schema.Type<typeof webSocketClosedEvent>;
