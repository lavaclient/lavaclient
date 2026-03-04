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

// TODO: optimize the player manager lol

import type { Player } from "../player.js";
import type { FetchOptions, PlayerManager } from "../players.js";
import type { VoiceServerUpdate, VoiceStateUpdate } from "../playerVoice.js";
import type { Cluster } from "./client.js";
import type { ClusterNode } from "./node.js";

import { nextOrThrow } from "./balancer.js";
import { getId, Identifiable } from "../tools.js";

export type ClusterPlayer = Player<ClusterNode>;

/**
 * A player manager that manages players across all nodes in a cluster.
 */
export class ClusterPlayerManager implements PlayerManager {
    private cached?: Map<string, ClusterPlayer>;

    constructor(
        readonly cluster: Cluster,
        readonly options: ClusterPlayerManagerOptions,
    ) {}

    get cache(): Map<string, ClusterPlayer> {
        return (this.cached ??= this.generateCache());
    }

    has(guild: Identifiable): boolean {
        const guildId = getId(guild);
        if (this.options.has) {
            return this.options.has(this, guildId);
        }

        for (const node of this.cluster.nodes.values()) {
            if (node.players.has(guildId)) return true;
        }

        return false;
    }

    resolve(guild: Identifiable): ClusterPlayer | undefined {
        const guildId = getId(guild);
        if (this.options.find) {
            return this.options.find(this, guildId);
        }

        for (const node of this.cluster.nodes.values()) {
            const player = node.players.resolve(guildId);
            if (player) return player;
        }

        return;
    }

    fetch(cache?: boolean | undefined): Promise<ClusterPlayer[]>;

    fetch(guild: Identifiable, options?: FetchOptions | undefined): Promise<ClusterPlayer | undefined>;

    async fetch(arg0: boolean | Identifiable | undefined, options: FetchOptions = {}) {
        if (typeof arg0 === "boolean") {
            const players: Player[][] = [];
            for (const node of this.cluster.nodes.values()) {
                players.push(await node.players.fetch(arg0));
            }

            if (arg0) {
                delete this.cached;
            }

            return players.flat();
        }

        const guildId = getId(arg0!);
        if (this.options.fetch) {
            return this.options.fetch(this, guildId, options);
        }

        const player = this.resolve(guildId);
        if (!options.force && player) {
            return player;
        }

        if (options.cache) {
            delete this.cached;
        }

        for (const node of this.cluster.nodes.values()) {
            const data = await node.players.fetch(guildId, options);
            if (data) return data;
        }

        return;
    }

    create(guild: Identifiable): Player {
        const cached = this.resolve(getId(guild));
        if (cached) return cached;

        const player = nextOrThrow(this.cluster.balancer).players.create(getId(guild));
        delete this.cached;

        return player;
    }

    destroy(guild: Identifiable, force?: boolean | undefined): Promise<boolean>;
    destroy(): Promise<number>;

    async destroy(guild?: Identifiable, force = false) {
        if (!guild) {
            let count = 0;
            for (const node of this.cluster.nodes.values()) {
                count += await node.players.destroy();
            }

            return count;
        }

        for (const node of this.cluster.nodes.values()) {
            if (await node.players.destroy(guild, force)) return true;
        }

        return false;
    }

    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<boolean> {
        return this.resolve(update.guild_id)?.voice?.handleVoiceUpdate(update) ?? Promise.resolve(false);
    }

    private generateCache() {
        const map = new Map<string, ClusterPlayer>();
        for (const node of this.cluster.nodes.values()) {
            for (const [k, v] of node.players.cache) map.set(k, v);
        }

        return map;
    }
}

/**
 * 
 */
export interface ClusterPlayerManagerOptions {
    /**
     * The function to use to check if a player exists for a given guild.
     *
     * @param pm      The player manager to use.
     * @param guildId The guild id to check for.
     */
    has?: (pm: ClusterPlayerManager, guild: Identifiable) => boolean;
    /**
     * The function to use to get the player for a given guild.
     *
     * @param pm      The player manager to use.
     * @param guildId The guild id to get the player for.
     */
    find?: (pm: ClusterPlayerManager, guild: Identifiable) => ClusterPlayer | undefined;
    /**
     * The function to use to fetch the player for a given guild.
     *
     * @param pm      The player manager to use.
     * @param guildId The guild id to fetch the player for.
     * @param options The options to use when fetching the player.
     */
    fetch?: (
        pm: ClusterPlayerManager,
        guild: Identifiable,
        options: FetchOptions,
    ) => Promise<ClusterPlayer | undefined>;
}
