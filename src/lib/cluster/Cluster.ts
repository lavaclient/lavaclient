import { ClusterNode } from "./ClusterNode";
import { Emitter, getId, DiscordResource, Snowflake  } from "../Utils";

import type { ConnectEvent, DisconnectEvent, SendGatewayPayload } from "../node/Node";
import type { ConnectionInfo } from "../node/Connection";
import type { Player, VoiceServerUpdate, VoiceStateUpdate } from "../Player";

export class Cluster extends Emitter<ClusterEvents> {
    readonly nodes: Map<String, ClusterNode>;
    readonly sendGatewayPayload: SendGatewayPayload;

    userId?: Snowflake;

    constructor(options: ClusterOptions) {
        super();

        this.nodes = new Map(options.nodes
            .map(n => this.forwardEvents(new ClusterNode(this, n.id, n)))
            .map(n => [ n.id, n ]));

        this.userId = options.user && getId(options.user);
        this.sendGatewayPayload = options.sendGatewayPayload;
    }

    get idealNodes(): ClusterNode[] {
        return [...this.nodes.values()]
            .filter(node => node.conn.active)
            .sort((a, b) => a.penalties - b.penalties);
    }

    connect(user: Snowflake | DiscordResource | undefined = this.userId) {
        this.userId ??= user && getId(user);
        this.nodes.forEach(node => node.connect(this.userId));
    }

    createPlayer(guild: Snowflake | DiscordResource, nodeId?: string): Player<ClusterNode> {
        const node = nodeId ? this.nodes.get(nodeId) : this.idealNodes[0];
        if (!node) throw new Error("No available nodes.");
        return node.createPlayer(guild);
    }

    destroyPlayer(guild: Snowflake | DiscordResource): boolean {
        return this.getNode(guild)?.destroyPlayer(guild) ?? false;
    }

    handleVoiceUpdate(update: VoiceServerUpdate | VoiceStateUpdate) {
        this.getNode(update.guild_id)?.handleVoiceUpdate(update);
    }

    getNode(guild: Snowflake | DiscordResource): ClusterNode | null {
        const guildId = getId(guild);
        return [...this.nodes.values()].find(n => n.players.has(guildId)) ?? null;
    }

    private forwardEvents(node: ClusterNode): ClusterNode {
        return node
            .on("connect", event => this.emit("nodeConnect", node, event))
            .on("disconnect", event => this.emit("nodeDisconnect", node, event))
            .on("error", error => this.emit("nodeError", node, error))
            .on("debug", message => this.emit("nodeDebug", node, message));
    }

}

export type ClusterEvents = {
    nodeConnect(node: ClusterNode, event: ConnectEvent): void;
    nodeDisconnect(node: ClusterNode, event: DisconnectEvent): void;
    nodeError(node: ClusterNode, error: Error): void;
    nodeDebug(node: ClusterNode, message: string): void;
};

export interface ClusterOptions {
    nodes: ClusterNodeOptions[];
    sendGatewayPayload: SendGatewayPayload;
    user?: Snowflake | DiscordResource;
}

export interface ClusterNodeOptions extends ConnectionInfo {
    id: string;
}
