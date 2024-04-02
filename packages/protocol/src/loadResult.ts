import * as S from "@effect/schema/Schema";

import { track, tracks } from "./player.js";

export const playlistInfo = S.struct({
    name: S.string,
    selectedTrack: S.number,
});

export const playlist = S.struct({
    info: playlistInfo,
    pluginInfo: S.record(S.string, S.unknown),
    tracks: tracks,
});

/**
 * Severity levels for an {@link exception}:
 *
 * - `common`
 *   The cause is known and expected, indicates that there is nothing wrong with the library itself.
 *
 * - `suspicious`
 *   The cause might not be exactly known, but is possibly caused by outside factors. For example when an outside
 *   service responds in a format that we do not expect.
 *
 * - `fault`
 *    If the probable cause is an issue with the library or when there is no way to tell what the cause might be.
 *    This is the default level and other levels are used in cases where the thrower has more in-depth knowledge
 *    about the error.
 */
export const exceptionSeverity = S.literal("common", "suspicious", "fault");

export const exception = S.struct({
    message: S.nullable(S.string),
    severity: exceptionSeverity,
    cause: S.string,
});

//

export const trackLoaded = S.struct({
    loadType: S.literal("track"),
    data: track,
});

export const playlistLoaded = S.struct({
    loadType: S.literal("playlist"),
    data: playlist,
});

export const searchLoadResult = S.struct({
    loadType: S.literal("search"),
    data: tracks,
});

export const emptyLoadResult = S.struct({
    loadType: S.literal("empty"),
    data: S.null,
});

export const errorLoadResult = S.struct({
    loadType: S.literal("error"),
    data: exception,
});

export const loadResult = S.union(trackLoaded, playlistLoaded, searchLoadResult, emptyLoadResult, errorLoadResult);

export type PlaylistInfo = S.Schema.To<typeof playlistInfo>;

export type Playlist = S.Schema.To<typeof playlist>;

export type ExceptionSeverity = S.Schema.To<typeof exceptionSeverity>;

export type Exception = S.Schema.To<typeof exception>;

export type TrackLoaded = S.Schema.To<typeof trackLoaded>;

export type PlaylistLoaded = S.Schema.To<typeof playlistLoaded>;

export type SearchLoadResult = S.Schema.To<typeof searchLoadResult>;

export type EmptyLoadResult = S.Schema.To<typeof emptyLoadResult>;

export type ErrorLoadResult = S.Schema.To<typeof errorLoadResult>;

export type LoadResult = S.Schema.To<typeof loadResult>;
