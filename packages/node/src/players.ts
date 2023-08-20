import { Node } from "./node";
import { Player } from "./player.js";
import { VoiceServerUpdate, VoiceStateUpdate } from "./playerVoice";

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

export interface PlayerManager {
    /**
     * The cache of players, mapped by guild id.
     *
     * **Warning:** This map should not be modified directly.
     */
    get cache(): Map<string, Player>;

    /**
     * Whether this player manager has a player for the given guild.
     */
    has(guildId: string): boolean;

    /**
     * Resolves a player for the given guild.
     *
     * @param guildId The guild id to resolve the player for.
     */
    resolve(guildId: string): Player | undefined;

    /**
     * Fetches all players from the lavalink node for this session.
     *
     * @param cache Whether to cache the players.
     */
    fetch(cache?: boolean): Promise<Player[]>;

    /**
     * Fetches a player from the lavalink node for this session.
     *
     * @param guildId The guild id to fetch the player for.
     * @param options The options for fetching the player.
     */
    fetch(guildId: string, options?: FetchOptions): Promise<Player | undefined>;

    /**
     * Creates a player for the given guild.
     */
    create(guildId: string): Player;

    /**
     * Destroys a player for the given guild.
     *
     * @param guildId The guild id to destroy the player for.
     * @param force   Whether to force destroy the player, even if it isn't cached.
     */
    destroy(guildId: string, force?: boolean): Promise<boolean>;

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

export class NodePlayerManager implements PlayerManager {
    /**
     * The cache of players.
     */
    readonly cache: Map<string, Player> = new Map();

    constructor(readonly node: Node) {}

    has(guildId: string): boolean {
        return this.cache.has(guildId);
    }

    resolve(guildId: string): Player | undefined {
        return this.cache.get(guildId);
    }

    create(guildId: string): Player {
        if (this.has(guildId)) {
            return this.resolve(guildId)!;
        }

        const player = this.node.createPlayer(guildId);
        this.cache.set(guildId, player);

        return player;
    }

    fetch(cache?: boolean | undefined): Promise<Player[]>;
    fetch(guildId: string, options?: FetchOptions | undefined): Promise<Player | undefined>;

    async fetch(arg0: boolean | string | undefined, options: FetchOptions = {}) {
        /* fetch single player. */
        if (typeof arg0 === "string") {
            let player = this.cache.get(arg0);
            if (!options.force && player) {
                return player;
            }

            const data = await this.node.ws.session?.player(arg0)?.fetchOrNull();

            if (data) {
                player = options.cache ? player ?? this.create(arg0) : this.node.createPlayer(arg0);
                return player.patch(data);
            }

            return;
        }

        /* fetch all players. */
        const response = (await this.node.ws.session?.players()) ?? [];
        return response.map((data) => {
            const player = arg0 ? this.create(data.guildId) : this.node.createPlayer(data.guildId);

            return player.patch(data);
        });
    }

    destroy(guildId: string, force?: boolean | undefined): Promise<boolean>;

    destroy(): Promise<number>;

    async destroy(guildId?: string, force = false) {
        if (!guildId) {
            let count = 0;
            for (const [_, player] of this.cache) {
                player.api.remove();
            }

            return count;
        }

        /* destroy a specific player: */
        const player = this.resolve(guildId);
        this.cache.delete(guildId);

        if (!player) {
            if (force) {
                return this.node.ws.session?.player(guildId)?.remove() ?? false;
            }

            return false;
        }

        return player.api.remove();
    }

    handleVoiceUpdate(update: VoiceStateUpdate | VoiceServerUpdate): Promise<boolean> {
        return this.resolve(update.guild_id)?.voice?.handleVoiceUpdate(update) ?? Promise.resolve(false);
    }
}
