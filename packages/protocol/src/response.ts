import * as S from "@effect/schema/Schema";
import * as C from "./common.js";

export const errorResponse = S.struct({
    timestamp: S.number,
    status: S.number,
    error: S.string,
    trace: S.optional(S.string),
    message: S.string,
    path: S.string,
});

export const version = S.struct({
    semver: S.string,
    major: S.number,
    minor: S.number,
    patch: S.number,
    preRelease: S.nullable(S.string),
});

export const git = S.struct({
    branch: S.string,
    commit: S.string,
    commitTime: S.number,
});

export const plugin = S.struct({
    name: S.string,
    version: S.string,
});

export const infoResponse = S.struct({
    version: version,
    buildTime: S.number,
    git: git,
    jvm: S.string,
    lavaplayer: S.string,
    sourceManagers: S.array(S.string),
    filters: S.array(S.string),
    plugins: S.array(plugin),
});

export const getPlayersResponse = S.array(C.player);

export const getPlayerResponse = C.player;

export const updatePlayerResponse = C.player;

export const updateSessionResponse = S.struct({
    resuming: S.boolean,
    timeout: S.number,
});

export const loadResultType = S.literal("track", "playlist", "search", "empty", "error");

export const playlistInfo = S.struct({
    name: S.string,
    selectedIndex: S.number,
});

export const trackLoadResult = S.struct({
    loadType: S.literal("track"),
    data: C.track,
});

export const playlistLoadResult = S.struct({
    loadType: S.literal("playlist"),
    data: S.struct({
        info: playlistInfo,
        pluginInfo: S.record(S.string, S.unknown),
        tracks: S.array(C.track),
    }),
});

export const searchLoadResult = S.struct({
    loadType: S.literal("search"),
    data: S.array(C.track),
});

export const emptyLoadResult = S.struct({
    loadType: S.literal("empty"),
    data: S.nullable(S.object),
});

export const errorLoadResult = S.struct({
    loadType: S.literal("error"),
    data: C.exception,
});

export const loadResult = S.union(
    trackLoadResult,
    playlistLoadResult,
    searchLoadResult,
    emptyLoadResult,
    errorLoadResult,
);

export type ErrorResponse = S.To<typeof errorResponse>;

export type Version = S.To<typeof version>;

export type Git = S.To<typeof git>;

export type Plugin = S.To<typeof plugin>;

export type InfoResponse = S.To<typeof infoResponse>;

export type GetPlayersResponse = S.To<typeof getPlayersResponse>;

export type GetPlayerResponse = S.To<typeof getPlayerResponse>;

export type UpdatePlayerResponse = S.To<typeof updatePlayerResponse>;

export type UpdateSessionResponse = S.To<typeof updateSessionResponse>;

export type LoadResultType = S.To<typeof loadResultType>;

export type PlaylistInfo = S.To<typeof playlistInfo>;

export type LoadResult = S.To<typeof loadResult>;
