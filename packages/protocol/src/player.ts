import * as S from "@effect/schema/Schema";

import { filters } from "./filters.js";

export const trackInfo = S.struct({
    /**
     * The track identifier.
     */
    identifier: S.string,
    /**
     * Whether the track is seekable.
     */
    isSeekable: S.boolean,
    /**
     * The track author.
     */
    author: S.string,
    /**
     * The track length in milliseconds.
     */
    length: S.number,
    /**
     * Whether the track is a live stream.
     */
    isStream: S.boolean,
    /**
     * The track position (in milliseconds).
     */
    position: S.number,
    /**
     * The track title.
     */
    title: S.string,
    /**
     * The track uri.
     */
    uri: S.nullable(S.string),
    /**
     * The track source name.
     */
    sourceName: S.string,
    /**
     * The track artwork url.
     */
    artworkUrl: S.nullable(S.string),
    /**
     * The track [ISRC](https://en.wikipedia.org/wiki/International_Standard_Recording_Code)
     */
    isrc: S.nullable(S.string),
});

export const track = S.struct({
    /**
     * The base64 encoded track data.
     */
    encoded: S.string,
    /**
     * Info about the track.
     */
    info: trackInfo,
    /**
     * Additional track info provided by plugins.
     */
    pluginInfo: S.record(S.string, S.unknown),
});

export const tracks = S.array(track);

export const encodedTracks = S.array(S.string);

export const voiceState = S.struct({
    /**
     * The Discord voice token.
     */
    token: S.string,
    /**
     * The Discord voice server endpoint.
     */
    endpoint: S.string,
    /**
     * The Discord voice session id.
     */
    sessionId: S.string,
});

export const playerState = S.struct({
    /**
     * The unix timestamp of when the state was constructed.
     */
    time: S.number,
    /**
     * The position of the current track (in milliseconds).
     */
    position: S.number,
    /**
     * Whether a voice connection for this player is active.
     */
    connected: S.boolean,
    /**
     * The calculated RTT of the player's voice connection.
     */
    ping: S.number,
});

export const player = S.struct({
    /**
     * The guild id of the player.
     */
    guildId: S.string,
    /**
     * The currently playing track.
     */
    track: S.nullable(track),
    /**
     * The volume of the player, range 0-1000, in percentage.
     */
    volume: S.number,
    /**
     * Whether the player is paused.
     */
    paused: S.boolean,
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

export type TrackInfo = S.Schema.To<typeof trackInfo>;

export type Track = S.Schema.To<typeof track>;

export type Tracks = S.Schema.To<typeof tracks>;

export type EncodedTracks = S.Schema.To<typeof encodedTracks>;

export type VoiceState = S.Schema.To<typeof voiceState>;

export type PlayerState = S.Schema.To<typeof playerState>;

export type Player = S.Schema.To<typeof player>;
