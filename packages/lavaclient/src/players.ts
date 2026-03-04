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

import type { Node } from "./node";
import type { Player } from "./player.js";
import type { VoiceServerUpdate, VoiceStateUpdate } from "./playerVoice";

import { Identifiable, getId } from "./tools.js";

export interface FetchOptions {
    /**
     * Whether to cache the player.
     */
    cache?: boolean;
    /**
     * Whether to force fetch the player, even if it is already cached.
     */
    force?: Boolean;
}

export interface PlayerManager<$Node extends Node = Node> {
    /**
     * The cache of players, mapped by guild id.
     *
     * **Warning:** This map should not be modified directly.
     */
    get cache(): Map<string, Player<$Node>>;

    /**
     * Whether this player manager has a player for the given guild.
     */
    has(guild: Identifiable): boolean;

    /**
     * Resolves a player for the given guild.
     *
     * @param guild The guild to resolve the player for.
     */
    resolve(guild: Identifiable): Player<$Node> | undefined;

    /**
     * Fetches all players from the lavalink node for this session.
     *
     * @param cache Whether to cache the players.
     */
    fetch(cache?: boolean): Promise<Player<$Node>[]>;

    /**
     * Fetches a player from the lavalink node for this session.
     *
     * @param guild   The guild to fetch the player for.
     * @param options The options for fetching the player.
     */
    fetch(guild: Identifiable, options?: FetchOptions): Promise<Player<$Node> | undefined>;

    /**
     * Creates a player for the given guild.
     */
    create(guild: Identifiable): Player<$Node>;

    /**
     * Destroys a player for the given guild.
     *
     * @param guild The guild id to destroy the player for.
     * @param force Whether to force destroy the player, even if it isn't cached.
     */
    destroy(guild: Identifiable, force?: boolean): Promise<boolean>;

    /**
     * Destroys all **cached** players.
     *
     * @returns The number of players destroyed.
     */
    destroy(): Promise<number>;

    /**
     * Handles a voice update from Discord.
     *
     * @param update The voice update to handle.
     */
    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<boolean>;
}

export class NodePlayerManager<$Node extends Node = Node> implements PlayerManager<$Node> {
    readonly cache: Map<string, Player<$Node>> = new Map();

    constructor(readonly node: $Node) {}

    has(guild: Identifiable): boolean {
        return this.cache.has(getId(guild));
    }

    resolve(guild: Identifiable): Player<$Node> | undefined {
        return this.cache.get(getId(guild));
    }

    create(guild: Identifiable): Player<$Node> {
        if (this.has(getId(guild))) {
            return this.resolve(getId(guild))!;
        }

        const player = this.node.createPlayer(getId(guild));
        this.cache.set(getId(guild), player);

        return player;
    }

    fetch(cache?: boolean | undefined): Promise<Player<$Node>[]>;

    fetch(guild: Identifiable, options?: FetchOptions | undefined): Promise<Player<$Node> | undefined>;

    async fetch(arg0: boolean | Identifiable | undefined, options: FetchOptions = {}) {
        /* fetch single player. */
        if (typeof arg0 === "boolean") {
            /* fetch all players. */
            const response = (await this.node.ws.session?.players()) ?? [];
            return response.map((data) => {
                const player = arg0 ? this.create(data.guildId) : this.node.createPlayer(data.guildId);

                return player.patch(data);
            });
        }

        const guildId = getId(arg0!);

        let player = this.cache.get(guildId);
        if (!options.force && player) {
            return player;
        }

        const data = await this.node.ws.session?.player(guildId)?.fetchOrNull();
        if (data) {
            player = options.cache ? player ?? this.create(guildId) : this.node.createPlayer(guildId);
            return player.patch(data);
        }

        return;
    }

    destroy(guild: Identifiable, force?: boolean | undefined): Promise<boolean>;

    destroy(): Promise<number>;

    async destroy(guild?: Identifiable, force = false) {
        if (!guild) {
            let count = 0;
            for (const [_, player] of this.cache) {
                player.api.remove();
            }

            return count;
        }

        /* destroy a specific player: */
        const player = this.resolve(getId(guild));
        this.cache.delete(getId(guild));

        if (!player) {
            if (force) {
                return this.node.ws.session?.player(getId(guild))?.remove() ?? false;
            }

            return false;
        }

        return player.api.remove();
    }

    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<boolean> {
        return this.resolve(update.guild_id)?.voice?.handleVoiceUpdate(update) ?? Promise.resolve(false);
    }
}
