import * as S from "@effect/schema/Schema";

import { encodedTracks, player, track, tracks, voiceState } from "./player.js";
import { session, sessionUpdate } from "./session.js";
import { loadResult } from "./loadResult.js";
import { info } from "./info.js";
import { stats } from "./stats.js";
import { ipRoutePlanner } from "./routeplanner.js";
import { filters } from "./filters.js";

export const RESTGetAPIPlayersResult = S.array(player);

/**
 * https://lavalink.dev/api/rest.html#get-players
 */
export const RESTGetAPIPlayers = {
    method: "GET" as const,
    path: "/v4/sessions/[sessionId]/players" as const,
    result: RESTGetAPIPlayersResult,
};

export const RESTGetAPIPlayerResult = player;

/**
 * https://lavalink.dev/api/rest.html#get-player
 */
export const RESTGetAPIPlayer = {
    method: "GET" as const,
    path: "/v4/sessions/[sessionId]/players/[guildId]" as const,
    result: RESTGetAPIPlayerResult,
};

export const RESTPatchAPIPlayerJSONBody = S.struct({
    /**
     * The track position in milliseconds.
     */
    position: S.number,
    /**
     *
     */
    endTime: S.nullable(S.number),
    /**
     * The player volume to set, from 0-1000.
     */
    volume: S.number,
    /**
     * Whether the player should be paused.
     */
    paused: S.boolean,
    /**
     * The new filters to apply. This overrides any previously applied filters.
     */
    filters,
    /**
     * Information required to create a voice connection.
     */
    voice: voiceState,
    // TODO: `identifier` and `encodedTrack` are exclusive, find out a way to validate that.
    /**
     * The identifier of the track to play.
     */
    identifier: S.string,
    /**
     * The base64 encoded track to play, `null` stops the current track.
     */
    encodedTrack: S.nullable(S.string),
}).pipe(S.partial);

export const RESTPatchAPIPlayerResult = player;

export const RESTPatchAPIPlayerQuery = S.struct({
    /**
     * Whether to replace the current track with the new track. Defaults to `false`.
     */
    noReplace: S.optional(S.boolean),
});

/**
 * https://lavalink.dev/api/rest.html#update-player
 */
export const RESTPatchAPIPlayer = {
    method: "PATCH" as const,
    path: "/v4/sessions/[sessionId]/players/[guildId]" as const,
    query: RESTPatchAPIPlayerQuery,
    jsonBody: RESTPatchAPIPlayerJSONBody,
    result: RESTPatchAPIPlayerResult,
};

/**
 * https://lavalink.dev/api/rest.html#update-player
 */
export const RESTDeleteAPIPlayer = {
    method: "DELETE" as const,
    path: "/v4/sessions/[sessionId]/players/[guildId]" as const,
};

export const RESTPatchAPISessionJSONBody = sessionUpdate;

export const RESTPatchAPISessionResult = session;

/**
 * https://lavalink.dev/api/rest.html#update-session
 */
export const RESTPatchAPISession = {
    method: "PATCH" as const,
    path: "/v4/sessions/[sessionId]" as const,
    jsonBody: RESTPatchAPISessionJSONBody,
    result: RESTPatchAPISessionResult,
};

export const RESTGetAPILoadTracksResult = loadResult;

export const RESTGetAPILoadTracksQuery = S.struct({
    identifier: S.string,
});

/**
 * https://lavalink.dev/api/rest.html#track-loading
 */
export const RESTGetAPILoadTracks = {
    method: "GET" as const,
    path: "/v4/loadtracks" as const,
    result: RESTGetAPILoadTracksResult,
    query: RESTGetAPILoadTracksQuery,
};

export const RESTGetAPIDecodeTrackResult = track;

export const RESTGetAPIDecodeTrackQuery = S.struct({
    /**
     * The base64 encoded track string.
     */
    encodedTrack: S.string,
});

/**
 * https://lavalink.dev/api/rest.html#track-searching
 */
export const RESTGetAPIDecodeTrack = {
    method: "GET" as const,
    path: "/v4/decodetrack" as const,
    result: RESTGetAPIDecodeTrackResult,
    query: RESTGetAPIDecodeTrackQuery,
};

export const RESTPostAPIDecodeTracksJSONBody = encodedTracks;

export const RESTPostAPIDecodeTracksResult = tracks;

/**
 * https://lavalink.dev/api/rest.html#track-searching
 */
export const RESTPostAPIDecodeTracks = {
    method: "POST" as const,
    path: "/v4/decodetracks" as const,
    jsonBody: RESTPostAPIDecodeTracksJSONBody,
    result: RESTPostAPIDecodeTracksResult,
};

export const RESTGetAPINodeInfoResult = info;

/**
 * https://lavalink.dev/api/rest.html#get-lavalink-info
 */
export const RESTGetAPINodeInfo = {
    method: "GET" as const,
    path: "/v4/info" as const,
    result: RESTGetAPINodeInfoResult,
};

export const RESTGetAPINodeStatsResult = stats;

/**
 * https://lavalink.dev/api/rest.html#get-lavalink-stats
 */
export const RESTGetAPINodeStats = {
    method: "GET" as const,
    path: "/v4/stats" as const,
    result: RESTGetAPINodeStatsResult,
};

export const RESTGetAPINodeVersionResult = S.string;

/**
 * https://lavalink.dev/api/rest.html#get-lavalink-version
 */
export const RESTGetAPINodeVersion = {
    method: "GET" as const,
    path: "/version" as const,
    result: RESTGetAPINodeVersionResult,
};

export const RESTGetAPIRoutePlannerStatusResult = ipRoutePlanner;

/**
 * https://lavalink.dev/api/rest.html#get-routeplanner-status
 */
export const RESTGetAPIRoutePlannerStatus = {
    method: "GET" as const,
    path: "/v4/routeplanner/status" as const,
    result: RESTGetAPIRoutePlannerStatusResult,
};

export const RESTPostAPIFreeFailedAddressJSONBody = S.struct({
    /**
     * The address to unmark as failed. This address must be in the same ip block.
     */
    address: S.string,
});

/**
 * https://lavalink.dev/api/rest.html#unmark-a-failed-address
 */
export const RESTPostAPIFreeFailedAddress = {
    method: "POST" as const,
    path: "/v4/routeplanner/free/address" as const,
    jsonBody: RESTPostAPIFreeFailedAddressJSONBody,
};

/**
 * https://lavalink.dev/api/rest.html#unmark-all-failed-address
 */
export const RESTPostAPIFreeAllFailedAddresses = {
    method: "POST" as const,
    path: "/v4/routeplanner/free/all" as const,
};

export type RESTGetAPIPlayerResult = S.Schema.To<typeof RESTGetAPIPlayerResult>;
export type RESTPatchAPIPlayerJSONBody = S.Schema.To<typeof RESTPatchAPIPlayerJSONBody>;
export type RESTPatchAPIPlayerResult = S.Schema.To<typeof RESTPatchAPIPlayerResult>;
export type RESTPatchAPIPlayer = typeof RESTPatchAPIPlayer;

export type RESTPatchAPISessionJSONBody = S.Schema.To<typeof RESTPatchAPISessionJSONBody>;
export type RESTPatchAPISessionResult = S.Schema.To<typeof RESTPatchAPISessionResult>;
export type RESTPatchAPISession = typeof RESTPatchAPISession;

export type RESTGetAPILoadTracksResult = S.Schema.To<typeof RESTGetAPILoadTracksResult>;
export type RESTGetAPILoadTracks = typeof RESTGetAPILoadTracks;

export type RESTGetAPIDecodeTrackResult = S.Schema.To<typeof RESTGetAPIDecodeTrackResult>;
export type RESTGetAPIDecodeTrack = typeof RESTGetAPIDecodeTrack;

export type RESTPostAPIDecodeTracksJSONBody = S.Schema.To<typeof RESTPostAPIDecodeTracksJSONBody>;
export type RESTPostAPIDecodeTracksResult = S.Schema.To<typeof RESTPostAPIDecodeTracksResult>;
export type RESTPostAPIDecodeTracks = typeof RESTPostAPIDecodeTracks;

export type RESTGetAPINodeInfoResult = S.Schema.To<typeof RESTGetAPINodeInfoResult>;
export type RESTGetAPINodeInfo = typeof RESTGetAPINodeInfo;

export type RESTGetAPINodeStatsResult = S.Schema.To<typeof RESTGetAPINodeStatsResult>;
export type RESTGetAPINodeStats = typeof RESTGetAPINodeStats;

export type RESTGetAPINodeVersionResult = S.Schema.To<typeof RESTGetAPINodeVersionResult>;
export type RESTGetAPINodeVersion = typeof RESTGetAPINodeVersion;

export type RESTGetAPIRoutePlannerStatusResult = S.Schema.To<typeof RESTGetAPIRoutePlannerStatusResult>;
export type RESTGetAPIRoutePlannerStatus = typeof RESTGetAPIRoutePlannerStatus;
