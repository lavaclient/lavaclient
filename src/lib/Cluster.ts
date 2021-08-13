import { ClusterNode } from "./node/ClusterNode";
import { Emitter, getId } from "./Utils";

import type { ConnectEvent, DisconnectEvent, SendGatewayPayload } from "./node/Node";
import type { ConnectionInfo } from "./node/Connection";
import type { Player, VoiceServerUpdate, VoiceStateUpdate } from "./Player";
import type { DiscordResource, Snowflake } from "../constants";

const _players = Symbol("Connection#_players")

export class Cluster extends Emitter<ClusterEvents> {
    readonly nodes: Map<String, ClusterNode>;
    readonly sendGatewayPayload: SendGatewayPayload;

    userId?: Snowflake;

    private [_players]?: Map<Snowflake, Player<ClusterNode>>;

    constructor(options: ClusterOptions) {
        super();

        this.nodes = Cluster.createNodes(this, options);

        this.userId = options.user && getId(options.user);
        this.sendGatewayPayload = options.sendGatewayPayload;
    }

    static createNodes(cluster: Cluster, options: ClusterOptions): Map<string, ClusterNode> {
        const nodes = new Map();
        for (const info of options.nodes) {
            const node = new ClusterNode(cluster, info.id, info);
            cluster.forwardEvents(node);
            nodes.set(info.id, node);
        }

        return nodes;
    }

    get players(): Map<Snowflake, Player<ClusterNode>> {
        if (!this[_players]) {
            this[_players] = new Map();
            for (const node of this.nodes.values()) {
                for (const [guild, player] of node.players) {
                    this[_players]!.set(guild, player);
                }
            }
        }

        return this[_players]!;
    }

    get idealNodes(): ClusterNode[] {
        return [...this.nodes.values()]
            .filter(node => node.connected)
            .sort((a, b) => a.penalties - b.penalties);
    }

    createPlayer(guild: Snowflake | DiscordResource, nodeId?: string): Player<ClusterNode> {
        const node = nodeId ? this.nodes.get(nodeId) : this.idealNodes[0];
        if (!node) {
            throw new Error("No available nodes.");
        }

        delete this[_players];
        return node.createPlayer(guild);
    }

    destroyPlayer(guild: Snowflake | DiscordResource): boolean {
        const removed = this.players.get(getId(guild))?.node?.destroyPlayer(guild) ?? false;
        if (removed) {
            delete this[_players];
        }

        return removed;
    }

    handleVoiceUpdate(update: VoiceServerUpdate | VoiceStateUpdate) {
        const player = this.players.get(update.guild_id);
        player?.handleVoiceUpdate(update);
    }

    private forwardEvents(node: ClusterNode) {
        node
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
