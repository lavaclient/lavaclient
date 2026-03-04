import * as S from "@effect/schema/Schema";

import { filters } from "./filters.js";

export const trackInfo = S.Struct({
    /**
     * The track identifier.
     */
    identifier: S.String,
    /**
     * Whether the track is seekable.
     */
    isSeekable: S.Boolean,
    /**
     * The track author.
     */
    author: S.String,
    /**
     * The track length in milliseconds.
     */
    length: S.Number,
    /**
     * Whether the track is a live stream.
     */
    isStream: S.Boolean,
    /**
     * The track position (in milliseconds).
     */
    position: S.Number,
    /**
     * The track title.
     */
    title: S.String,
    /**
     * The track uri.
     */
    uri: S.NullOr(S.String),
    /**
     * The track source name.
     */
    sourceName: S.String,
    /**
     * The track artwork url.
     */
    artworkUrl: S.NullOr(S.String),
    /**
     * The track [ISRC](https://en.wikipedia.org/wiki/International_Standard_Recording_Code)
     */
    isrc: S.NullOr(S.String),
});

export const track = S.Struct({
    /**
     * The base64 encoded track data.
     */
    encoded: S.String,
    /**
     * Info about the track.
     */
    info: trackInfo,
    /**
     * Additional track info provided by plugins.
     */
    pluginInfo: S.Record(S.String, S.Unknown),
    /**
     * Addition track data provided via the Update Player endpoint.
     */
    userData: S.Record(S.String, S.Unknown),
});

export const tracks = S.Array(track);

export const encodedTracks = S.Array(S.String);

export const voiceState = S.Struct({
    /**
     * The Discord voice token.
     */
    token: S.String,
    /**
     * The Discord voice server endpoint.
     */
    endpoint: S.String,
    /**
     * The Discord voice session id.
     */
    sessionId: S.String,
});

export const playerState = S.Struct({
    /**
     * The unix timestamp of when the state was constructed.
     */
    time: S.Number,
    /**
     * The position of the current track (in milliseconds).
     */
    position: S.Number,
    /**
     * Whether a voice connection for this player is active.
     */
    connected: S.Boolean,
    /**
     * The calculated RTT of the player's voice connection.
     */
    ping: S.Number,
});

export const player = S.Struct({
    /**
     * The guild id of the player.
     */
    guildId: S.String,
    /**
     * The currently playing track.
     */
    track: S.NullOr(track),
    /**
     * The volume of the player, range 0-1000, in percentage.
     */
    volume: S.Number,
    /**
     * Whether the player is paused.
     */
    paused: S.Boolean,
    /**
     * The state of the
     */
    state: playerState,
    /**
     * The voice state of the player.
     */
    voice: voiceState,
    /**
     * The filters used by the player.
     */
    filters,
});

export type TrackInfo = S.Schema.Type<typeof trackInfo>;

export type Track = S.Schema.Type<typeof track>;

export type Tracks = S.Schema.Type<typeof tracks>;

export type EncodedTracks = S.Schema.Type<typeof encodedTracks>;

export type VoiceState = S.Schema.Type<typeof voiceState>;

export type PlayerState = S.Schema.Type<typeof playerState>;

export type Player = S.Schema.Type<typeof player>;
