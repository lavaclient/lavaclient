import * as S from "@effect/schema/Schema";
import * as F from "./filter.js";

export const trackInfo = S.struct({
    identifier: S.string,
    isSeekable: S.boolean,
    author: S.string,
    length: S.number,
    isStream: S.boolean,
    position: S.number,
    title: S.string,
    uri: S.nullable(S.string),
    artworkUrl: S.nullable(S.string),
    isrc: S.nullable(S.string),
    sourceName: S.string,
});

export const track = S.struct({
    encoded: S.string,
    info: trackInfo,
    pluginInfo: S.record(S.string, S.unknown),
});

export const voice = S.struct({
    token: S.string,
    endpoint: S.string,
    sessionId: S.string,
});

export const filters = S.partial(
    S.extend(
        F.builtInFilters,
        S.struct({
            pluginFilters: S.partial(F.pluginFilters),
        }),
    ),
);

export const playerState = S.struct({
    time: S.number,
    position: S.nullable(S.number),
    connected: S.boolean,
    ping: S.number,
});

export const player = S.struct({
    guildId: S.string,
    track: S.nullable(track),
    volume: S.number,
    paused: S.boolean,
    state: playerState,
    voice: S.nullable(voice),
    filters: filters,
});

export const exceptionsSeverity = S.literal("common", "suspicious", "fault");

export const exception = S.struct({
    message: S.nullable(S.string),
    severity: exceptionsSeverity,
    cause: S.string,
});

export const memory = S.struct({
    free: S.number,
    used: S.number,
    allocated: S.number,
    reservable: S.number,
});

export const cpu = S.struct({
    cores: S.number,
    systemLoad: S.number,
    lavalinkLoad: S.number,
});

export const frameStats = S.struct({
    sent: S.number,
    nulled: S.number,
    deficit: S.number,
});

export const stats = S.struct({
    players: S.number,
    playingPlayers: S.number,
    uptime: S.number,
    memory: memory,
    cpu: cpu,
    frameStats: S.nullable(frameStats),
});

export type TrackInfo = S.To<typeof trackInfo>;

export type Track = S.To<typeof track>;

export type Voice = S.To<typeof voice>;

export type Filters = S.To<typeof filters>;

export type PlayerState = S.To<typeof playerState>;

export type Player = S.To<typeof player>;

export type Stats = S.To<typeof stats>;

export type ExceptionSeverity = S.To<typeof exceptionsSeverity>;

export type Exception = S.To<typeof exception>;
