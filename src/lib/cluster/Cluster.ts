import { TypedEmitter } from "tiny-typed-emitter";
import { DiscordResource, getId, ManagerOptions, Snowflake } from "../Utils";
import { ClusterNode } from "./ClusterNode";

import type * as Lavalink from "@lavaclient/types/v3";
import type { ConnectionInfo } from "../node/Connection";
import type { ConnectEvent, DisconnectEvent, SendGatewayPayload } from "../node/Node";
import type { REST } from "../node/REST";
import type { Player, VoiceServerUpdate, VoiceStateUpdate } from "../Player";

export class Cluster extends TypedEmitter<ClusterEvents> {
    readonly nodes: Map<string, ClusterNode>;
    readonly sendGatewayPayload: SendGatewayPayload;

    userId?: Snowflake;

    constructor(options: ClusterOptions) {
        super();

        this.sendGatewayPayload = options.sendGatewayPayload;
        this.userId = options.user && getId(options.user);

        this.nodes = new Map(options.nodes.map(n => [ n.id, new ClusterNode(this, n.id, n) ]));
    }

    get rest(): REST | null {
        return this.idealNodes[0]?.rest ?? null;
    }

    get idealNodes(): ClusterNode[] {
        return [ ...this.nodes.values() ]
            .filter(node => node.conn.active)
            .sort((a, b) => a.penalties - b.penalties);
    }

    connect(user: Snowflake | DiscordResource | undefined = this.userId): void {
        this.userId ??= user && getId(user);
        for (const [ , node ] of this.nodes) {
            node.connect(this.userId);
        }
    }

    createPlayer(guild: Snowflake | DiscordResource, nodeId?: string): Player<ClusterNode> {
        const node = nodeId ? this.nodes.get(nodeId) : this.idealNodes[0];
        if (!node) throw new Error("No available nodes.");
        return node.createPlayer(guild);
    }

    getPlayer(guild: Snowflake | DiscordResource): Player<ClusterNode> | null {
        const guildId = getId(guild);
        return this.getNode(guildId)?.players?.get(guildId) ?? null;
    }

    async destroyPlayer(guild: Snowflake | DiscordResource): Promise<boolean> {
        const destroyed = await this.getNode(guild)?.destroyPlayer(guild);
        return destroyed ?? false;
    }

    async handleVoiceUpdate(
        update: VoiceServerUpdate | VoiceStateUpdate,
    ): Promise<boolean> {
        const accepted = await this.getNode(update.guild_id)?.handleVoiceUpdate(update);
        return accepted ?? false;
    }

    getNode(guild: Snowflake | DiscordResource): ClusterNode | null {
        const guildId = getId(guild);
        return [ ...this.nodes.values() ].find(n => n.players.has(guildId)) ?? null;
    }
}

export interface ClusterEvents {
    nodeConnect: (node: ClusterNode, event: ConnectEvent) => void;
    nodeDisconnect: (node: ClusterNode, event: DisconnectEvent) => void;
    nodeError: (node: ClusterNode, error: Error) => void;
    nodeDebug: (node: ClusterNode, message: string) => void;
    nodeRaw: (node: ClusterNode, message: Lavalink.IncomingMessage) => void;
}

export interface ClusterOptions extends ManagerOptions {
    nodes: ClusterNodeOptions[];
}

export interface ClusterNodeOptions extends ConnectionInfo {
    id: string;
}
