/*
 * Copyright 2023 Dimensional Fun & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Client, ClientDebugEvent, ClientEvents } from "../client.js";

import * as Protocol from "lavalink-protocol";
import * as API from "lavalink-api-client";
import * as WS from "lavalink-ws-client";

import { Emitter } from "../tools.js";

import type { PlayerManager } from "../players.js";
import type { NodeDiscordOptions } from "../node.js";

import { DefaultLoadBalancer, LoadBalancer, LoadBalancerFactory, nextOrThrow } from "./balancer.js";
import { ClusterNode, ClusterNodeOptions } from "./node.js";
import { ClusterPlayerManager, ClusterPlayerManagerOptions } from "./players.js";

/**
 * A client that manages multiple nodes.
 */
export class Cluster extends Emitter<ClusterEvents> implements Client {
    /**
     * All nodes registered to this cluster.
     */
    readonly nodes: Map<string, ClusterNode> = new Map();

    /**
     * The load balancer for this cluster.
     */
    readonly balancer: LoadBalancer;

    /**
     * The player manager for this Client.
     */
    readonly players: PlayerManager;

    /**
     * The user id that is being authenticated with.
     */
    userId: string | undefined = undefined;

    private connectedAt: number | undefined = undefined;
    private readyAt: number | undefined = undefined;

    constructor(readonly options: ClusterOptions) {
        super();

        this.players = new ClusterPlayerManager(this, options.players ?? {});
        this.balancer = (options?.loadBalancer ?? DefaultLoadBalancer)(this);

        for (const nodeOptions of options.nodes) {
            const node = new ClusterNode(this, nodeOptions);
            this.nodes.set(node.identifier, node);

            node.ws.once("ready", () => {
                if (this.ready) {
                    this.readyAt = performance.now();
                    this.emit("ready", { took: this.uptime });
                }
            });
        }
    }

    /**
     * Whether every node in this cluster is in the 'Ready' state.
     */
    get ready() {
        return every(this.nodes.values(), (it) => it.ws.state === WS.LavalinkWSClientState.Ready);
    }

    /**
     * The Lavalink HTTP client for executing requests. 
     * This will return the HTTP client of the node with the least penalties.
     */
    get rest(): API.LavalinkHttpClient {
        return nextOrThrow(this.balancer).rest;
    }

    /**
     * The entrypoint into most user-land API calls. 
     * This will return the API instance of the node with the least penalties.
     */
    get api(): API.LavalinkAPI {
        return nextOrThrow(this.balancer).api;
    }

    /**
     * The amount of time this client has been connected to the lavalink node(s).
     */
    get uptime(): number {
        const reference = this.readyAt ?? this.connectedAt;
        return reference ? performance.now() - reference : -1;
    }

    /**
     * Connects to all node(s) in this cluster.
     * @param userId The ID of the user to authenticate as.
     */
    connect(userId?: string): void {
        if (userId) this.userId = userId;

        for (const [k, v] of this.nodes) {
            this.debug({ system: "ws", message: `connecting to node: ${k}` });
            v.connect(this.userId);
        }

        this.connectedAt = Date.now();
    }

    /**
     * Disconnects from all node(s) in this cluster.
     */
    disconnect(): void {
        for (const [k, v] of this.nodes) {
            this.debug({ system: "ws", message: `disconnecting from node: ${k}` });
            v.disconnect();
        }
    }

    private debug(event: ClientDebugEvent, node?: ClusterNode) {
        if (node && this.listenerCount("nodeDebug")) this.emit("nodeDebug", node, event);
        if (this.listenerCount("debug")) this.emit("debug", event);
    }
}

const every = <T>(iterator: IterableIterator<T>, fn: (value: T, idx: number) => boolean): boolean => {
    let idx = 0;
    for (const value of iterator) if (!fn(value, idx++)) return false;
    return true;
};

export type ClusterEvents = ClientEvents & {
    nodeDebug: (node: ClusterNode, event: ClientDebugEvent) => void;

    nodeError: (node: ClusterNode, error: Error) => void;

    nodeMessage: (node: ClusterNode, message: Protocol.Message) => void;

    nodeConnected: (node: ClusterNode, event: WS.LavalinkWSClientConnectedEvent) => void;

    nodeDisconnected: (node: ClusterNode, event: WS.LavalinkWSClientDisconnectedEvent) => void;

    nodeReconnecting: (node: ClusterNode) => void;

    nodeReady: (node: ClusterNode, event: WS.LavalinkWSClientReadyEvent) => void;

    nodeRequest: (node: ClusterNode, event: API.LavalinkHttpClientRequestEvent) => void;
};

export interface ClusterOptions {
    /**
     * The nodes to use for this cluster.
     */
    nodes: ClusterNodeOptions[];
    /**
     * The options to use for Discord.
     */
    discord: NodeDiscordOptions;
    /**
     * Methods used to find and fetch players in this client, do not provide custom methods
     * unless you know what you're doing.
     */
    players?: ClusterPlayerManagerOptions;
    /**
     * The {@link LoadBalancerFactory} to use for this cluster.
     */
    loadBalancer?: LoadBalancerFactory;
}
