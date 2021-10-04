import { Connection, ConnectionInfo } from "./Connection";
import { Dictionary, DiscordResource, getId, ManagerOptions, Snowflake } from "../Utils";
import { NodeState } from "./NodeState";
import { Player, VoiceServerUpdate, VoiceStateUpdate } from "../Player";
import { REST } from "./REST";
import { TypedEmitter } from "tiny-typed-emitter";

import type * as Lavalink from "@lavaclient/types";

export class Node extends TypedEmitter<NodeEvents> {
    static DEBUG_FORMAT = "{topic}: {message}";
    static DEBUG_FORMAT_PLAYER = "[player {player}] {topic}: {message}";
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

    readonly players = new Map<Snowflake, Player<this>>();
    readonly conn: Connection;
    readonly rest = new REST(this);
    readonly sendGatewayPayload: SendGatewayPayload;

    state = NodeState.Idle;
    stats = Node.DEFAULT_STATS;
    userId?: Snowflake;

    constructor(options: NodeOptions) {
        super();

        this.sendGatewayPayload = options.sendGatewayPayload;
        this.userId = options.user && getId(options.user);

        this.conn = new Connection(this, options.connection);
    }

    get penalties(): number {
        const cpu = Math.pow(1.05, 100 * this.stats.cpu.systemLoad) * 10 - 10;

        let deficit = 0, nulled = 0;
        if (this.stats.frameStats?.deficit !== -1) {
            deficit = Math.pow(1.03, 500 * ((this.stats.frameStats?.deficit ?? 0) / 3000)) * 600 - 600;
            nulled = (Math.pow(1.03, 500 * ((this.stats.frameStats?.nulled ?? 0) / 3000)) * 600 - 600) * 2;
            nulled *= 2;
        }

        return cpu + deficit + nulled;
    }

    connect(user: Snowflake | DiscordResource | undefined = this.userId): void {
        this.userId ??= user && getId(user);
        if (!this.userId) {
            throw new Error("No User-Id is present.");
        }

        return this.conn.connect();
    }

    createPlayer(guild: Snowflake | DiscordResource): Player<this> {
        let player = this.players.get(getId(guild));
        if (!player) {
            player = new Player<this>(this, guild);
            this.players.set(getId(guild), player);
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

    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): void {
        const player = this.players.get(update.guild_id);
        player?.handleVoiceUpdate(update);
    }

    debug(topic: string, message: string, player?: Player): void {
        return void this.emit("debug", (player ? Node.DEBUG_FORMAT_PLAYER : Node.DEBUG_FORMAT)
            .replace("{topic}", topic)
            .replace("{message}", message)
            .replace("{player}", player?.guildId ?? "N/A"));
    }
}

export type SendGatewayPayload = (id: Snowflake, payload: { op: 4, d: Dictionary }) => void;

export interface NodeEvents {
    connect: (event: ConnectEvent) => void;
    disconnect: (event: DisconnectEvent) => void;
    error: (error: Error) => void;
    debug: (message: string) => void;
    raw: (message: Lavalink.IncomingMessage) => void;
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

export interface NodeOptions extends ManagerOptions {
    connection: ConnectionInfo;
}
