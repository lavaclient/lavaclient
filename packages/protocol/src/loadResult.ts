import * as S from "@effect/schema/Schema";

import { track, tracks } from "./player.js";

export const playlistInfo = S.Struct({
    name: S.String,
    selectedTrack: S.Number,
});

export const playlist = S.Struct({
    info: playlistInfo,
    pluginInfo: S.Record(S.String, S.Unknown),
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
export const exceptionSeverity = S.Literal("common", "suspicious", "fault");

export const exception = S.Struct({
    message: S.NullOr(S.String),
    severity: exceptionSeverity,
    cause: S.String,
});

//

export const trackLoaded = S.Struct({
    loadType: S.Literal("track"),
    data: track,
});

export const playlistLoaded = S.Struct({
    loadType: S.Literal("playlist"),
    data: playlist,
});

export const searchLoadResult = S.Struct({
    loadType: S.Literal("search"),
    data: tracks,
});

export const emptyLoadResult = S.Struct({
    loadType: S.Literal("empty"),
    data: S.Null,
});

export const errorLoadResult = S.Struct({
    loadType: S.Literal("error"),
    data: exception,
});

export const loadResult = S.Union(trackLoaded, playlistLoaded, searchLoadResult, emptyLoadResult, errorLoadResult);

export type PlaylistInfo = S.Schema.Type<typeof playlistInfo>;

export type Playlist = S.Schema.Type<typeof playlist>;

export type ExceptionSeverity = S.Schema.Type<typeof exceptionSeverity>;

export type Exception = S.Schema.Type<typeof exception>;

export type TrackLoaded = S.Schema.Type<typeof trackLoaded>;

export type PlaylistLoaded = S.Schema.Type<typeof playlistLoaded>;

export type SearchLoadResult = S.Schema.Type<typeof searchLoadResult>;

export type EmptyLoadResult = S.Schema.Type<typeof emptyLoadResult>;

export type ErrorLoadResult = S.Schema.Type<typeof errorLoadResult>;

export type LoadResult = S.Schema.Type<typeof loadResult>;
