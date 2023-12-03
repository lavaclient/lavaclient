import * as S from "@effect/schema/Schema";

/**
 * Frame statistics.
 */
export const frameStats = S.struct({
    /**
     * The amount of frames that were sent to Discord.
     */
    sent: S.number,
    /**
     * The amount of frames that were nulled.
     */
    nulled: S.number,
    /**
     * The amount of frames that were deficit.
     */
    deficit: S.number,
});

/**
 * Memory statistics.
 */
export const memory = S.struct({
    /**
     * The amount of free memory.
     */
    free: S.number,
    /**
     * The amount of used memory (in bytes).
     */
    used: S.number,
    /**
     * The amount of allocated memory (in bytes).
     */
    allocated: S.number,
    /**
     * The amount of reservable memory (in bytes).
     */
    reservable: S.number,
});

/**
 * CPU statistics.
 */
export const cpu = S.struct({
    /**
     * The amount of cores the node has.
     */
    cores: S.number,
    /**
     * The system load of the node.
     */
    systemLoad: S.number,
    /**
     * The load of Lavalink on the node.
     */
    lavalinkLoad: S.number,
});

/**
 * Representation of node stats.
 */
export const stats = S.struct({
    /**
     * The frame stats of the node. null, if the node has no players or when retrieved via `/v4/stats`
     */
    frameStats: S.nullable(frameStats),
    /**
     * The amount of players connected to the node.
     */
    players: S.number,
    /**
     * The amount of players playing a track.
     */
    playingPlayers: S.number,
    /**
     * The uptime of the node (in milliseconds).
     */
    uptime: S.number,
    /**
     * The memory stats of the node.
     */
    memory,
    /**
     * The CPU stats of the node.
     */
    cpu,
});

export type FrameStats = S.Schema.To<typeof frameStats>;

export type Memory = S.Schema.To<typeof memory>;

export type CPU = S.Schema.To<typeof cpu>;

export type Stats = S.Schema.To<typeof stats>;
