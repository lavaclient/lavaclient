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

import type * as Protocol from "lavalink-protocol";

import type { Cluster, ClusterEvents } from "./client.js";
import type { ClientDebugEvent } from "../client.js";

import { Node, NodeEvents, NodeOptions } from "../node.js";
import { Penalties } from "./penalty.js";

export class ClusterNode extends Node {
    /**
     * The identifier of this cluster node.
     */
    readonly identifier: string;

    /**
     * The penalty calculator for this node.
     */
    readonly penalties = new Penalties(this);

    constructor(
        readonly cluster: Cluster,
        options: ClusterNodeOptions,
    ) {
        super({ discord: cluster.options.discord, ...options });

        this.identifier = options.identifier ?? `${options.info.host}:${options.info.port}`;
    }

    override emit<U extends keyof NodeEvents>(event: U, ...args: Parameters<NodeEvents[U]>): boolean {
        const _event = `node${event.replace(/(\b\w)/, (i) => i.toUpperCase())}` as keyof ClusterEvents;
        if (this.cluster.listenerCount(_event)) {
            // @ts-expect-error Fuck off lmfao
            return this.cluster.emit(_event, this, ...args);
        }

        if (event === "debug") {
            const event = args[0] as ClientDebugEvent;
            return this.cluster.emit("debug", {
                ...event,
                message: `[${this.identifier}] ${event.message}`,
            });
        }

        return false;
    }

    protected override handlePlayerMessage(message: Exclude<Protocol.Message, { op: "ready" | "stats" }>) {
        const player = this.players.resolve(message.guildId);
        if (!player) {
            this.emit("debug", { system: "ws", message: `received '${message.op}' for unknown player` });
            return;
        }

        if (message.op === "event") {
            player.handleEvent(message);
            switch (message.type) {
                case "TrackStartEvent":
                    this.penalties.loadsAttempted++;
                    break;
                case "TrackEndEvent":
                    if (message.reason === "loadFailed") this.penalties.loadsFailed++;
                    break;
                case "TrackExceptionEvent":
                    this.penalties.tracksFailed++;
                    break;
                case "TrackStuckEvent":
                    this.penalties.tracksStuck++;
                    break;
            }
        } else {
            player.patchWithState(message.state);
        }
    }
}

export type ClusterNodeOptions = Omit<NodeOptions, "discord"> & {
    identifier?: string;
};
