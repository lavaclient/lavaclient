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

import * as Protocol from "lavalink-protocol";
import * as API from "lavalink-api-client";
import * as WS from "lavalink-ws-client";

import { Client, ClientEvents } from "./client.js";
import { Player } from "./player.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { NodePlayerManager, PlayerManager } from "./players.js";

export class Node extends TypedEmitter<NodeEvents> implements Client {
    /**
     * The player manager for this node.
     */
    readonly players: PlayerManager<this>;

    /**
     * The Lavalink API client for this node.
     */
    readonly rest: API.LavalinkHttpClient;

    /**
     * The Lavalink WS client for this node.
     */
    readonly ws: WS.LavalinkWSClient;

    /**
     * The entrypoint for most user-land API calls.
     */
    readonly api: API.LavalinkAPI;

    userId: string | undefined;

    constructor(readonly options: NodeOptions) {
        super();

        this.players = new NodePlayerManager(this);
        this.rest = new API.LavalinkHttpClient({ ...options.info, ...options.rest });
        this.api = new API.LavalinkAPI(this.rest);
        this.ws = new WS.LavalinkWSClient(this.api, { ...options.ws, userId: options.discord.userId });
        this.userId = options.discord.userId;

        /* attach event listeners. */

        // http
        this.rest.on("request", (event) => this.emit("request", event));

        // websocket
        this.ws.on("ready", (event) => this.emit("ready", event));

        this.ws.on("debug", (message) => this.emit("debug", { system: "ws", message }));

        this.ws.on("error", (error) => this.emit("error", error));

        this.ws.on("connected", (event) => this.emit("connected", event));

        this.ws.on("disconnected", (event) => this.emit("disconnected", event));

        this.ws.on("message", (message) => {
            if (message.op === "event" || message.op === "playerUpdate") this.handlePlayerMessage(message);
        });
    }

    /**
     * The amount of time this node has been connected to the lavalink node (in milliseconds).
     */
    get uptime(): number {
        return this.ws.uptime;
    }

    /**
     * Connects to the lavalink node.
     *
     * @param userId The user id to authenticate with.
     */
    connect(options: WS.LavalinkWSClientConnectOptions = {}) {
        if (options.userId) this.userId = options.userId;
        this.ws.connect(options);
    }

    /**
     * Disconnects from the lavalink node.
     */
    disconnect(): void {
        this.ws.disconnect();
    }

    /**
     * @internal
     */
    createPlayer(guildId: string): Player<this> {
        return new Player(this, guildId);
    }

    override emit<E extends keyof NodeEvents>(event: E, ...args: Parameters<NodeEvents[E]>): boolean {
        return this.listenerCount(event) > 0 ? super.emit(event, ...args) : false;
    }

    protected handlePlayerMessage(message: Exclude<Protocol.Message, { op: "ready" | "stats" }>) {
        const player = this.players.resolve(message.guildId);
        if (!player) {
            this.emit("debug", { system: "ws", message: `received '${message.op}' for unknown player` });
            return;
        }

        message.op === "event" ? player.handleEvent(message) : player.patchWithState(message.state);
    }
}

type BaseNodeEvents = ClientEvents &
    Omit<WS.LavalinkWSClientEvents, "debug"> & {
        request: (event: API.LavalinkHttpClientRequestEvent) => void;
    };

export interface NodeEvents extends BaseNodeEvents {}

type InfoKeys = "host" | "port" | "tls" | "auth";

export interface NodeDiscordOptions {
    /**
     * The user id to authenticate with.
     */
    userId?: string;

    /**
     * A method used to send gateway commands to Discord.
     */
    sendGatewayCommand: (guildId: string, data: unknown) => void;
}

export type NodeOptions = {
    /**
     * Crucial information about the node.
     */
    info: Pick<API.LavalinkHttpClientOptions, InfoKeys>;

    /**
     * Options for Discord.
     */
    discord: NodeDiscordOptions;

    /**
     * Options to pass to the Lavalink API client.
     */
    rest?: Omit<API.LavalinkHttpClientOptions, InfoKeys>;

    /**
     * Options to pass to the Lavalink WS client.
     */
    ws?: Omit<WS.LavalinkWSClientOptions, "userId">;
};
