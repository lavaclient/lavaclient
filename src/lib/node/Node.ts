import { Connection, ConnectionInfo } from "./Connection";
import { Emitter, getId } from "../Utils";
import { NodeState } from "./NodeState";
import { Player, VoiceServerUpdate, VoiceStateUpdate } from "../Player";

import type * as Lavalink from "@lavaclient/types";
import type { Dictionary, DiscordResource, Snowflake } from "../../constants";

const _conn = Symbol("Node#_conn")
const _userId = Symbol("Node#_userId")

export class Node extends Emitter<NodeEvents> {
    static DEFAULT_STATS: Lavalink.StatsData = {
        cpu: {
            cores: 0,
            lavalinkLoad: 0,
            systemLoad: 0
        },
        frameStats: {
            deficit: 0,
            nulled: 0,
            sent: 0
        },
        memory: {
            allocated: 0,
            free: 0,
            reservable: 0,
            used: 0
        },
        players: 0,
        playingPlayers: 0,
        uptime: 0
    };

    readonly players: Map<Snowflake, Player<this>>;
    readonly sendGatewayPayload: SendGatewayPayload;

    state: NodeState;
    stats: Lavalink.StatsData;

    private [_userId]?: Snowflake;
    private readonly [_conn]: Connection;

    constructor(options: NodeOptions) {
        super();

        this.players = new Map();
        this.sendGatewayPayload = options.sendGatewayPayload;

        this.state = NodeState.Idle;
        this.stats = Node.DEFAULT_STATS;

        this[_userId] = typeof options.user === "string" ? options.user : options.user?.id;
        this[_conn] = new Connection(this, options.connection);
    }

    get conn() {
        return this[_conn];
    }

    get connected() {
        return this.conn.active;
    }

    get userId(): Snowflake | undefined {
        return this[_userId];
    }

    set userId(user: Snowflake | { id: Snowflake } | undefined) {
        this[_userId] = typeof user === "string" ? user : user?.id;
    }

    get penalties() {
        const cpu = Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10;

        let deficit = 0, nulled = 0;
        if (this.stats.frameStats?.deficit !== -1) {
            deficit =
                Math.pow(1.03, 500 * ((this.stats.frameStats?.deficit ?? 0) / 3000)) * 600 - 600;
            nulled =
                (Math.pow(1.03, 500 * ((this.stats.frameStats?.nulled ?? 0) / 3000)) * 600 - 600) * 2;
            nulled *= 2;
        }

        return cpu + deficit + nulled;
    }


    connect(user: Snowflake | { id: Snowflake }) {
        this.userId ??= user;
        return this[_conn].connect();
    }

    createPlayer(guild: Snowflake | DiscordResource): Player<this> {
        const guildId = typeof guild === "string" ? guild : guild.id;

        let player = this.players.get(guildId);
        if (!player) {
            player = new Player<this>(this, guild);
            this.players.set(guildId, player);
        }

        return player;
    }

    destroyPlayer(guild: Snowflake | DiscordResource): boolean {
        const player = this.players.get(getId(guild));
        if (player) {
            player.destroy();
            this.players.delete(player.guildId);
        }

        return !!player;
    }

    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate) {
        const player = this.players.get(update.guild_id);
        player?.handleVoiceUpdate(update);
    }
}

export type SendGatewayPayload = (id: Snowflake, payload: { op: 4, d: Dictionary }) => void;
export type NodeEvents = {
    connect: (event: ConnectEvent) => void;
    disconnect: (event: DisconnectEvent) => void;
    error: (error: Error) => void;
    debug: (message: string) => void;
}

export interface ConnectEvent {
    took: number;
    reconnect: boolean;
}

export interface DisconnectEvent {
    code: number;
    reason: string;
    reconnecting: boolean;
    wasClean: boolean;
}

export interface NodeOptions {
    connection: ConnectionInfo;
    sendGatewayPayload: SendGatewayPayload;
    user?: Snowflake | { id: Snowflake };
}
