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

import type * as API from "lavalink-api-client";
import type * as WS from "lavalink-ws-client";

import type { PlayerManager } from "./players.js";
import type { Player } from "./player.js";

import type TypedEmitter from "typed-emitter";

// TODO: events

export interface Client extends TypedEmitter<ClientEvents> {
    /**
     * The player manager for this Client.
     */
    readonly players: PlayerManager;

    /**
     * The amount of time this client has been connected to the lavalink node(s).
     */
    get uptime(): number;

    /**
     * The user id that is being authenticated with.
     */
    get userId(): string | undefined;

    /**
     * The Lavalink HTTP client for executing requests.
     * Depending on the implementation of this interface, this may not always return the same instance.
     */
    get rest(): API.LavalinkHttpClient;

    /**
     * The entrypoint into most user-land API calls.
     * Depending on the implementation of this interface, this may not always return the same instance.
     */
    get api(): API.LavalinkAPI;

    /**
     * Connects this Client to the lavalink node(s).
     *
     * @param options The options to connect with.
     */
    connect(options?: WS.LavalinkWSClientConnectOptions): void;

    /**
     * Disconnects this Client from the lavalink node(s).
     */
    disconnect(): void;
}

/**
 *
 */
export type ClientDebugEvent = {
    message: string;
} & (
    | {
          system: "ws" | "rest";
      }
    | {
          system: "player";
          subsystem: "voice" | "track" | "event";
          player: Player;
      }
);

export type ClientEvents = {
    /** Used for debugging the client. */
    debug: (event: ClientDebugEvent) => void;

    /**
     * Emitted whenever an error occurs in within the client.
     * @param error The error that occured.
     */
    error: (error: Error) => void;

    /**
     * Emitted when the client is ready to be used.
     */
    ready: (event: { took: number }) => void;
};
