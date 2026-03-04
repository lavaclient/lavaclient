import { Schema as S } from "effect";

/**
 * Frame statistics.
 */
export const frameStats = S.Struct({
    /**
     * The amount of frames that were sent to Discord.
     */
    sent: S.Number,
    /**
     * The amount of frames that were nulled.
     */
    nulled: S.Number,
    /**
     * The amount of frames that were deficit.
     */
    deficit: S.Number,
});

/**
 * Memory statistics.
 */
export const memory = S.Struct({
    /**
     * The amount of free memory.
     */
    free: S.Number,
    /**
     * The amount of used memory (in bytes).
     */
    used: S.Number,
    /**
     * The amount of allocated memory (in bytes).
     */
    allocated: S.Number,
    /**
     * The amount of reservable memory (in bytes).
     */
    reservable: S.Number,
});

/**
 * CPU statistics.
 */
export const cpu = S.Struct({
    /**
     * The amount of cores the node has.
     */
    cores: S.Number,
    /**
     * The system load of the node.
     */
    systemLoad: S.Number,
    /**
     * The load of Lavalink on the node.
     */
    lavalinkLoad: S.Number,
});

/**
 * Representation of node stats.
 */
export const stats = S.Struct({
    /**
     * The frame stats of the node. null, if the node has no players or when retrieved via `/v4/stats`
     */
    frameStats: S.NullOr(frameStats),
    /**
     * The amount of players connected to the node.
     */
    players: S.Number,
    /**
     * The amount of players playing a track.
     */
    playingPlayers: S.Number,
    /**
     * The uptime of the node (in milliseconds).
     */
    uptime: S.Number,
    /**
     * The memory stats of the node.
     */
    memory,
    /**
     * The CPU stats of the node.
     */
    cpu,
});

export type FrameStats = S.Schema.Type<typeof frameStats>;

export type Memory = S.Schema.Type<typeof memory>;

export type CPU = S.Schema.Type<typeof cpu>;

export type Stats = S.Schema.Type<typeof stats>;
